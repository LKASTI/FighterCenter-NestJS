import { Controller, Get, Post, Req, Res, UseGuards, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../authentication/guards/jwtAuth.guard";
import { JwtRefreshTokenService } from "@domain/jwtRefreshToken";

@Controller("auth")
export class AuthController {
    private readonly proxyPrefix: string;

    constructor(
        private readonly jwtService: JwtService,
        private readonly jwtRefreshTokenService: JwtRefreshTokenService,
        private readonly configService: ConfigService,
    ) {
        const isPreview = this.configService.get<boolean>('IS_PREVIEW');
        this.proxyPrefix = isPreview ? '/api-preview' : '/api';
    }

    @Get("startgg")
    @UseGuards(AuthGuard("startgg"))
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async startGGAuth() {
        // Guard initiates redirect to StartGG
    }

    @Get("startgg/callback")
    @UseGuards(AuthGuard("startgg"))
    @Throttle({ default: { limit: 20, ttl: 900000 } }) // 20 requests per 15 minutes
    async startggCallback(@Req() req, @Res() res) {
        const user = req.user;

        const payload = {
            sub: user.startggId,
            startggUserID: user.startggUserID, // Add UUID for database foreign keys
            username: user.startggUsername,
            gamerTag: user.startggGamerTag,
            roles: user.roles,
            tournamentSeriesAssigned: user.tournamentSeriesAssigned,
            sf6ProfileCharacters: user.sf6ProfileCharacters
        };

        // Create access token (15 minutes)
        const accessToken = this.jwtService.sign(payload);

        // Create refresh token (7 days)
        const { plainToken: refreshToken } = await this.jwtRefreshTokenService.createRefreshToken(
            user.startggUserID,
            req.headers['user-agent'],
        );

        const nodeEnv = process.env.NODE_ENV;
        const isLocal = nodeEnv === "local";

        // Access token cookie configuration
        const accessCookieOptions: any = {
            httpOnly: true,
            secure: !isLocal,
            sameSite: "lax",
            maxAge: parseInt(process.env.JWT_EXPIRATION_DURATION || "900") * 1000, // 15 minutes
            path: "/",
        };

        // Refresh token cookie configuration
        // Local dev uses "/" due to Vite proxy cookie path issues
        // Production uses restricted path for security (only sent to refresh endpoint)
        const refreshCookieOptions: any = {
            httpOnly: true,
            secure: !isLocal,
            sameSite: "lax",
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRATION || "604800") * 1000, // 7 days
            path: isLocal ? "/" : this.proxyPrefix + "/auth/refresh",
        };

        // Add domain for local development
        if (isLocal) {
            accessCookieOptions.domain = "localhost";
            refreshCookieOptions.domain = "localhost";
        }

        res.cookie("auth-token", accessToken, accessCookieOptions);
        res.cookie("refresh-token", refreshToken, refreshCookieOptions);

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Req() req) {
        return req.user;
    }

    @Post("refresh")
    @Throttle({ default: { limit: 50, ttl: 900000 } }) // 50 requests per 15 minutes
    async refreshAccessToken(@Req() req, @Res() res) {
        const refreshToken = req.cookies['refresh-token'];

        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }

        // Validate refresh token with session binding
        const dbToken = await this.jwtRefreshTokenService.validateRefreshToken(
            refreshToken,
            req.headers['user-agent'],
        );

        if (!dbToken) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Create new access token
        const user = dbToken.user;
        const payload = {
            sub: user.startggId,
            startggUserID: user.startggUserID, // UUID for database foreign keys
            username: user.startggUsername,
            gamerTag: user.startggGamerTag,
            roles: user.roles,
            tournamentSeriesAssigned: user.tournamentSeriesAssigned,
            sf6ProfileCharacters: user.sf6ProfileCharacters,
        };

        const accessToken = this.jwtService.sign(payload);

        const nodeEnv = process.env.NODE_ENV;
        const isLocal = nodeEnv === "local";

        // Set new access token cookie
        const accessCookieOptions: any = {
            httpOnly: true,
            secure: !isLocal,
            sameSite: "lax",
            maxAge: parseInt(process.env.JWT_EXPIRATION_DURATION || "900") * 1000, // 15 minutes
            path: "/",
        };

        if (isLocal) {
            accessCookieOptions.domain = "localhost";
        }

        res.cookie("auth-token", accessToken, accessCookieOptions);

        return res.json({
            success: true,
            message: 'Token refreshed successfully'
        });
    }

    @Post("logout")
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 100, ttl: 900000 } }) // 100 requests per 15 minutes
    async logout(@Req() req, @Res() res) {
        const user = req.user;

        // Revoke all refresh tokens for this user
        await this.jwtRefreshTokenService.revokeAllUserTokens(user.id);

        const nodeEnv = process.env.NODE_ENV;
        const isLocal = nodeEnv === "local";


        // Clear access token cookie
        const clearAccessOptions: any = {
            path: "/",
        };

        // Clear refresh token cookie (must match the path used when setting)
        const clearRefreshOptions: any = {
            path: isLocal ? "/" : this.proxyPrefix + "/auth/refresh",
        };

        if (isLocal) {
            clearAccessOptions.domain = "localhost";
            clearRefreshOptions.domain = "localhost";
        }

        res.clearCookie("auth-token", clearAccessOptions);
        res.clearCookie("refresh-token", clearRefreshOptions);

        res.json({ success: true });
    }
}
