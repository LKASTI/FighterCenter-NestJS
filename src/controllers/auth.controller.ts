import { Controller, Get, Post, Req, Res, UseGuards, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
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
    ) {
        this.proxyPrefix = process.env.IS_PREVIEW? '/api-preview' : '/api'
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
            req.ip,
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
        // Note: Path includes /api prefix for local dev (Vite proxy) and production (Vercel rewrite)
        const refreshCookieOptions: any = {
            httpOnly: true,
            secure: !isLocal,
            sameSite: "lax",
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRATION || "604800") * 1000, // 7 days
            path: this.proxyPrefix + "/auth/refresh", // Only sent to refresh endpoint
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

        // Validate refresh token
        const dbToken = await this.jwtRefreshTokenService.validateRefreshToken(refreshToken);

        if (!dbToken) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Create new access token
        const user = dbToken.user;
        const payload = {
            sub: user.startggId,
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

        // Clear refresh token cookie
        const clearRefreshOptions: any = {
            path: this.proxyPrefix + "/auth/refresh",
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
