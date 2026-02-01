import {
    Injectable,
    Logger,
    ServiceUnavailableException,
    NotFoundException,
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
}

@Injectable()
export class AuthClientService {
    private readonly logger = new Logger(AuthClientService.name);
    private readonly authServiceUrl: string;
    private readonly apiKey: string;
    private readonly cache = new Map<string, CacheEntry>();
    private readonly MAX_CACHE_SIZE = 1000;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

    private evictOldestCacheEntry(): void {
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    }

    private async callAuthService<T>(path: string): Promise<T | null> {
        const cacheKey = path;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            return cached.data;
        }

        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.authServiceUrl}${path}`, {
                    headers: { "x-api-key": this.apiKey },
                    timeout: 5000,
                }),
            );

            // Evict oldest entry if cache is full
            this.evictOldestCacheEntry();

            // Cache for 5 minutes
            this.cache.set(cacheKey, {
                data: response.data,
                expires: Date.now() + this.CACHE_TTL,
            });

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 404) {
                    return null;
                }
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
        return this.callAuthService(`/api/users/${userId}`);
    }

    async getUserByStartggId(startggId: string): Promise<AuthUser | null> {
        return this.callAuthService(`/api/users/by-startgg/${startggId}`);
    }

    async getUserByGoogleId(googleId: string): Promise<AuthUser | null> {
        return this.callAuthService(`/api/users/by-google/${googleId}`);
    }

    async getUserByEmail(email: string): Promise<AuthUser | null> {
        return this.callAuthService(`/api/users/by-email/${email}`);
    }

    async validatePermissions(
        userId: string,
        requiredRoles?: string[],
        tournamentSeriesId?: string,
    ): Promise<{ allowed: boolean; reason?: string }> {
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
            return response.data;
        } catch (error) {
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
