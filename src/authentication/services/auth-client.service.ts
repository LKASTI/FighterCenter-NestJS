import {
    Injectable,
    Logger,
    ServiceUnavailableException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { AxiosError } from "axios";

/**
 * SECURITY NOTE:
 * - This service calls the auth service using API key authentication
 * - MUST use HTTPS in production (configure AUTH_SERVICE_URL with https://)
 * - API key should be rotated regularly
 * - Network-level restrictions recommended (firewall, VPC, etc.)
 */

export interface AuthUser {
    userId: string;
    startggId: string | null;
    googleId: string | null;
    startggSlug: string | null;
    startggDiscriminator: string | null;
    startggUsername: string | null;
    startggGamerTag: string | null;
    startggEncryptedToken: string | null;
    startggEncryptedRefreshToken: string | null;
    startggTokenExpiresIn: number | null;
    googleEmail: string | null;
    email: string | null;
    roles: string[];
    tournamentSeriesAssigned: string[];
    sf6ProfileCharacters: string[];
}

interface CacheEntry {
    data: any;
    expires: number;
    lastAccessed: number;
}

@Injectable()
export class AuthClientService {
    private readonly logger = new Logger(AuthClientService.name);
    private readonly authServiceUrl: string;
    private readonly apiKey: string;
    private readonly cache = new Map<string, CacheEntry>();
    private readonly MAX_CACHE_SIZE = 1000;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Circuit breaker state
    private circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private failureCount = 0;
    private readonly FAILURE_THRESHOLD = 5;
    private readonly CIRCUIT_RESET_TIMEOUT = 60000; // 1 minute
    private circuitOpenTime = 0;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.authServiceUrl = this.configService.get<string>(
            "AUTH_SERVICE_URL",
        )!;
        this.apiKey = this.configService.get<string>(
            "AUTH_SERVICE_API_KEY",
        )!;
    }

    /**
     * Circuit Breaker Pattern:
     * - CLOSED: Normal operation, requests go through
     * - OPEN: Too many failures, reject requests immediately (fail fast)
     * - HALF_OPEN: Testing if service recovered, allow 1 request through
     */
    private checkCircuitBreaker(): void {
        if (this.circuitState === 'OPEN') {
            // Check if enough time has passed to try again
            if (Date.now() - this.circuitOpenTime > this.CIRCUIT_RESET_TIMEOUT) {
                this.logger.warn('Circuit breaker entering HALF_OPEN state');
                this.circuitState = 'HALF_OPEN';
            } else {
                throw new ServiceUnavailableException(
                    'Auth service circuit breaker is OPEN. Service temporarily unavailable.'
                );
            }
        }
    }

    private recordSuccess(): void {
        if (this.circuitState === 'HALF_OPEN') {
            this.logger.log('Circuit breaker closing - service recovered');
            this.circuitState = 'CLOSED';
        }
        this.failureCount = 0;
    }

    private recordFailure(): void {
        this.failureCount++;

        if (this.failureCount >= this.FAILURE_THRESHOLD) {
            this.logger.error(
                `Circuit breaker opening - ${this.failureCount} consecutive failures`
            );
            this.circuitState = 'OPEN';
            this.circuitOpenTime = Date.now();
        }
    }

    /**
     * Evicts the least recently used (LRU) cache entry
     */
    private evictLRUCacheEntry(): void {
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            let oldestKey: string | null = null;
            let oldestTime = Infinity;

            // Find the least recently accessed entry
            for (const [key, entry] of this.cache.entries()) {
                if (entry.lastAccessed < oldestTime) {
                    oldestTime = entry.lastAccessed;
                    oldestKey = key;
                }
            }

            if (oldestKey) {
                this.cache.delete(oldestKey);
                this.logger.debug(`Evicted LRU cache entry: ${oldestKey}`);
            }
        }
    }

    private async callAuthService<T>(path: string): Promise<T | null> {
        const cacheKey = path;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            // Update last accessed time for LRU
            cached.lastAccessed = Date.now();
            return cached.data;
        }

        // Check circuit breaker before making request
        this.checkCircuitBreaker();

        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.authServiceUrl}${path}`, {
                    headers: { "x-api-key": this.apiKey },
                    timeout: 5000,
                }),
            );

            // Record success for circuit breaker
            this.recordSuccess();

            // Evict LRU entry if cache is full
            this.evictLRUCacheEntry();

            // Cache for 5 minutes
            this.cache.set(cacheKey, {
                data: response.data,
                expires: Date.now() + this.CACHE_TTL,
                lastAccessed: Date.now(),
            });

            return response.data;
        } catch (error) {
            // 404 is a normal "not found" response, not a service failure
            if (error instanceof AxiosError && error.response?.status === 404) {
                this.recordSuccess();
                return null;
            }

            // Record failure for circuit breaker (actual errors only)
            this.recordFailure();

            if (error instanceof AxiosError) {
                if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
                    this.logger.error(
                        `Auth service unavailable: ${error.message}`,
                    );
                    throw new ServiceUnavailableException(
                        "Authentication service is currently unavailable",
                    );
                }
                this.logger.error(
                    `Auth service error: ${error.response?.status} - ${error.message}`,
                );
                throw new ServiceUnavailableException(
                    "Failed to communicate with authentication service",
                );
            }
            this.logger.error(`Unexpected error calling auth service: ${error}`);
            throw error;
        }
    }

    async getUserById(userId: string): Promise<AuthUser | null> {
        return this.callAuthService(`/api/users/${encodeURIComponent(userId)}`);
    }

    async getUserByStartggId(startggId: string): Promise<AuthUser | null> {
        return this.callAuthService(`/api/users/by-startgg/${encodeURIComponent(startggId)}`);
    }

    async getUserByGoogleId(googleId: string): Promise<AuthUser | null> {
        return this.callAuthService(`/api/users/by-google/${encodeURIComponent(googleId)}`);
    }

    async getUserByEmail(email: string): Promise<AuthUser | null> {
        return this.callAuthService(`/api/users/by-email/${encodeURIComponent(email)}`);
    }

    async validatePermissions(
        userId: string,
        requiredRoles?: string[],
        tournamentSeriesId?: string,
    ): Promise<{ allowed: boolean; reason?: string }> {
        // Check circuit breaker before making request
        this.checkCircuitBreaker();

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.authServiceUrl}/api/users/validate-permissions`,
                    { userId, requiredRoles, tournamentSeriesId },
                    {
                        headers: { "x-api-key": this.apiKey },
                        timeout: 5000,
                    },
                ),
            );

            // Record success for circuit breaker
            this.recordSuccess();

            return response.data;
        } catch (error) {
            // Record failure for circuit breaker
            this.recordFailure();

            if (error instanceof AxiosError) {
                if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
                    this.logger.error(
                        `Auth service unavailable: ${error.message}`,
                    );
                    throw new ServiceUnavailableException(
                        "Authentication service is currently unavailable",
                    );
                }
            }
            this.logger.error(`Error validating permissions: ${error}`);
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}
