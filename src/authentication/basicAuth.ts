import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class BasicAuth implements NestMiddleware {
    private readonly logger = new Logger(BasicAuth.name);

    use(req: Request, res: Response, next: NextFunction) {
        // Only apply in development environment
        if (process.env.NODE_ENV !== "development") {
            return next();
        }

        if (this.shouldSkipAuth(req)) {
            return next();
        }

        const auth = req.headers.authorization;

        // Check if Authorization header exists and is Basic auth
        if (!auth || !auth.startsWith("Basic ")) {
            res.setHeader('WWW-Authenticate', 'Basic realm="FighterCenter Development"');
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
                this.logger.error("DEV_PASSWORD environment variable not set");
                return res.status(500).json({
                    statusCode: 500,
                    message: "Server configuration error",
                    error: "Internal Server Error",
                });
            }

            if (username === validUsername && password === validPassword) {
                next(); // Authentication successful
            } else {
                res.setHeader('WWW-Authenticate', 'Basic realm="FighterCenter Development"');
                return res.status(401).json({
                    statusCode: 401,
                    message: "Invalid credentials",
                    error: "Unauthorized",
                });
            }
        } catch (error) {
            this.logger.error("Basic auth parsing error", error);

            res.setHeader('WWW-Authenticate', 'Basic realm="FighterCenter Development"');
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
            "/stripe/webhook", // Stripe webhook endpoint
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
