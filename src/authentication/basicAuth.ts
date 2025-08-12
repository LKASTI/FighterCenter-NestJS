import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class BasicAuth implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Only apply in development environment
        if (process.env.NODE_ENV !== "development") {
            return next();
        }

        if (this.shouldSkipAuth(req)) {
            // console.log(`Skipping basic auth for OAuth route: ${req.path}`);
            return next();
        }

        const auth = req.headers.authorization;

        // Check if Authorization header exists and is Basic auth
        if (!auth || !auth.startsWith("Basic ")) {
            return res.status(401).json({
                statusCode: 401,
                message: "Authentication required for development environment",
                error: "Unauthorized",
            });
        }

        try {
            // Decode base64 credentials
            const credentials = Buffer.from(auth.slice(6), "base64").toString(
                "utf-8",
            );
            const [username, password] = credentials.split(":");

            // Validate credentials
            const validUsername = process.env.DEV_USERNAME || "dev";
            const validPassword = process.env.DEV_PASSWORD;

            if (!validPassword) {
                console.error("DEV_PASSWORD environment variable not set");
                return res.status(500).json({
                    statusCode: 500,
                    message: "Server configuration error",
                    error: "Internal Server Error",
                });
            }

            if (username === validUsername && password === validPassword) {
                next(); // Authentication successful
            } else {
                return res.status(401).json({
                    statusCode: 401,
                    message: "Invalid credentials",
                    error: "Unauthorized",
                });
            }
        } catch (error) {
            console.error("Basic auth parsing error:", error);

            return res.status(401).json({
                statusCode: 401,
                message: "Invalid authorization header format",
                error: "Unauthorized",
            });
        }
    }

    private shouldSkipAuth(req: Request): boolean {
        // Skip basic auth for certain paths
        const skippablePaths = [
            "/auth/startgg", // OAuth initiation
            "/auth/startgg/callback", // OAuth callback
            "/health",
            "/ping",
            "/client/media",
            "/twitterShare/share"
        ];

        // Check if current path should skip auth
        return skippablePaths.some((path) =>
            req.path.startsWith(path),
        );
    }
}
