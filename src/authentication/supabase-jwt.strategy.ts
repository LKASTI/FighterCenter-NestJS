import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { createPublicKey } from "crypto";
import { Request } from "express";

interface JwksKey {
    kid?: string;
    kty: string;
    n?: string;
    e?: string;
    crv?: string;
    x?: string;
    y?: string;
}

interface JwksResponse {
    keys: JwksKey[];
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(
    Strategy,
    "supabase-jwt",
) {
    private readonly logger = new Logger(SupabaseJwtStrategy.name);
    private readonly jwksUrl: string;
    private readonly jwtSecret?: string;
    private readonly jwksCacheTtlMs: number;
    private readonly jwksFetchTimeoutMs: number;
    private readonly jwksForceRefreshCooldownMs: number;
    private jwksCache: JwksResponse | null = null;
    private jwksFetchedAtMs = 0;
    private jwksForcedRefreshAtMs = 0;
    private pemCache = new Map<string, string>();

    constructor(private readonly configService: ConfigService) {
        const issuerUrl = configService.get<string>("SUPABASE_ISSUER_URL");
        const jwtSecret = configService.get<string>("SUPABASE_JWT_SECRET");
        if (!issuerUrl && !jwtSecret) {
            throw new Error(
                "SUPABASE_ISSUER_URL or SUPABASE_JWT_SECRET must be configured",
            );
        }

        const resolvedIssuerUrl = issuerUrl?.replace(/\/+$/, "");
        const configuredJwksUrl = configService.get<string>("SUPABASE_JWKS_URL");
        const resolvedJwksUrl =
            configuredJwksUrl?.replace(/\/+$/, "") ||
            `${resolvedIssuerUrl}/.well-known/jwks.json`;
        const jwtAudience =
            configService.get<string>("SUPABASE_JWT_AUDIENCE") ||
            "authenticated";
        const ttlSeconds = Number(
            configService.get<string>("SUPABASE_JWKS_CACHE_TTL_SECONDS") || "600",
        );
        const jwksCacheTtlMs = Math.max(
            60,
            Number.isNaN(ttlSeconds) ? 600 : ttlSeconds,
        ) * 1000;
        const jwksFetchTimeoutMsRaw = Number(
            configService.get<string>("SUPABASE_JWKS_FETCH_TIMEOUT_MS") || "5000",
        );
        const jwksFetchTimeoutMs = Math.max(
            1000,
            Number.isNaN(jwksFetchTimeoutMsRaw) ? 5000 : jwksFetchTimeoutMsRaw,
        );
        const jwksForceRefreshCooldownMsRaw = Number(
            configService.get<string>(
                "SUPABASE_JWKS_FORCE_REFRESH_COOLDOWN_MS",
            ) || "10000",
        );
        const jwksForceRefreshCooldownMs = Math.max(
            1000,
            Number.isNaN(jwksForceRefreshCooldownMsRaw)
                ? 10000
                : jwksForceRefreshCooldownMsRaw,
        );

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            passReqToCallback: true,
            audience: jwtAudience,
            issuer: resolvedIssuerUrl || undefined,
            algorithms: jwtSecret ? ["HS256"] : ["RS256", "ES256"],
            secretOrKeyProvider: (_req, rawJwtToken, done) => {
                this.resolveVerificationKey(rawJwtToken)
                    .then((key) => done(null, key))
                    .catch((error) => done(error as Error));
            },
        });

        this.jwksUrl = resolvedJwksUrl;
        this.jwtSecret = jwtSecret;
        this.jwksCacheTtlMs = jwksCacheTtlMs;
        this.jwksFetchTimeoutMs = jwksFetchTimeoutMs;
        this.jwksForceRefreshCooldownMs = jwksForceRefreshCooldownMs;
    }

    private decodeBase64UrlJson(segment: string): Record<string, any> {
        const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(
            normalized.length + ((4 - (normalized.length % 4)) % 4),
            "=",
        );
        const decoded = Buffer.from(padded, "base64").toString("utf8");
        try {
            return JSON.parse(decoded);
        } catch {
            throw new UnauthorizedException("Malformed JWT segment");
        }
    }

    private parseHeaderAndPayload(rawJwtToken: string) {
        const [headerPart, payloadPart] = rawJwtToken.split(".");
        if (!headerPart || !payloadPart) {
            throw new UnauthorizedException("Malformed JWT");
        }
        return {
            header: this.decodeBase64UrlJson(headerPart),
            payload: this.decodeBase64UrlJson(payloadPart),
        };
    }

    private get isJwksCacheValid(): boolean {
        return (
            !!this.jwksCache &&
            Date.now() - this.jwksFetchedAtMs < this.jwksCacheTtlMs
        );
    }

    private async getSupabaseJwks(forceRefresh = false): Promise<JwksResponse> {
        if (!forceRefresh && this.isJwksCacheValid) return this.jwksCache!;

        if (
            forceRefresh &&
            this.jwksForcedRefreshAtMs > 0 &&
            Date.now() - this.jwksForcedRefreshAtMs <
                this.jwksForceRefreshCooldownMs &&
            this.jwksCache
        ) {
            return this.jwksCache;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            this.jwksFetchTimeoutMs,
        );
        const response = await fetch(this.jwksUrl, {
            signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
        if (!response.ok) {
            throw new UnauthorizedException(
                `Unable to fetch Supabase JWKS (${response.status})`,
            );
        }

        const jwks = (await response.json()) as JwksResponse;
        this.jwksCache = jwks;
        this.jwksFetchedAtMs = Date.now();
        if (forceRefresh) {
            this.jwksForcedRefreshAtMs = this.jwksFetchedAtMs;
        }
        this.pemCache.clear();
        this.logger.log(
            `[getSupabaseJwks] cache populated keyCount=${jwks.keys?.length || 0}`,
        );
        return jwks;
    }

    private toPemFromJwk(jwk: JwksKey): string {
        const keyObject = createPublicKey({
            key: jwk as any,
            format: "jwk",
        });
        return keyObject.export({ format: "pem", type: "spki" }).toString();
    }

    private async resolveAsymmetricKey(kid: string): Promise<string> {
        const cachedPem = this.pemCache.get(kid);
        if (cachedPem) return cachedPem;

        const jwks = await this.getSupabaseJwks(false);
        let key = jwks.keys?.find((entry) => entry.kid === kid);
        if (!key) {
            const refreshed = await this.getSupabaseJwks(true);
            key = refreshed.keys?.find((entry) => entry.kid === kid);
        }
        if (!key) {
            throw new UnauthorizedException(
                "Unable to find matching Supabase JWKS key",
            );
        }

        const pem = this.toPemFromJwk(key);
        this.pemCache.set(kid, pem);
        return pem;
    }

    private async resolveVerificationKey(rawJwtToken: string): Promise<string> {
        const { header } = this.parseHeaderAndPayload(rawJwtToken);
        const alg = String(header.alg || "");

        if (alg.startsWith("HS")) {
            if (!this.jwtSecret) {
                throw new UnauthorizedException(
                    "Supabase JWT secret is not configured for symmetric tokens",
                );
            }
            return this.jwtSecret;
        }

        const kid = header.kid;
        if (!kid || typeof kid !== "string") {
            throw new UnauthorizedException("Supabase JWT missing kid header");
        }
        return this.resolveAsymmetricKey(kid);
    }

    async validate(_request: Request, payload: any) {
        if (!payload?.sub) {
            throw new UnauthorizedException("Invalid Supabase token payload");
        }
        return {
            supabaseUserId: String(payload.sub),
            email: payload.email ? String(payload.email) : null,
        };
    }
}
