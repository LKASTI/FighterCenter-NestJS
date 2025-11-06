import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "../authentication/guards/jwtAuth.guard";

@Controller("auth")
export class AuthController {
    constructor(private readonly jwtService: JwtService) {}

    @Get("startgg")
    @UseGuards(AuthGuard("startgg"))
    async startGGAuth() {
        // Guard initiates redirect to StartGG
    }

    @Get("startgg/callback")
    @UseGuards(AuthGuard("startgg"))
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

        const token = this.jwtService.sign(payload);

        const nodeEnv = process.env.NODE_ENV;
        const isLocal = nodeEnv === "local";

        // Cookie configuration based on environment
        const cookieOptions: any = {
            httpOnly: true,
            secure: !isLocal, // HTTP only in local environment
            sameSite: "lax", // Changed from "none" for better CSRF protection
            maxAge: parseInt(process.env.JWT_EXPIRATION_DURATION || "900") * 1000, // 15 minutes default
            path: "/",
        };

        // Add domain for local development (works across all localhost ports)
        if (isLocal) {
            cookieOptions.domain = "localhost";
        }

        res.cookie("auth-token", token, cookieOptions);

        // Debug logging in non-production environments
        if (nodeEnv !== "production") {
            console.log("=== AUTH CALLBACK DEBUG ===");
            console.log("Environment:", nodeEnv);
            console.log("Frontend URL:", process.env.FRONTEND_URL);
            console.log("Cookie Options:", cookieOptions);
        }

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Req() req) {
        return req.user;
    }

    @Post("logout")
    async logout(@Res() res) {
        const nodeEnv = process.env.NODE_ENV;
        const isLocal = nodeEnv === "local";

        // Clear cookie with same options used when setting it
        const clearOptions: any = {
            path: "/",
        };

        if (isLocal) {
            clearOptions.domain = "localhost";
        }

        res.clearCookie("auth-token", clearOptions);
        res.json({ success: true });
    }
}
