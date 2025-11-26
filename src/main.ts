import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import "reflect-metadata";
import { BasicAuth } from "./authentication/basicAuth";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    // Production environment validation
    if (process.env.NODE_ENV === 'production') {
        // Validate JWT secret strength
        if (/^(.)\1+$/.test(process.env.JWT_SECRET)) { // All same character
            throw new Error('JWT_SECRET must not be a repeated character');
        }
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
            throw new Error(
                'PRODUCTION ERROR: JWT_SECRET must be at least 32 characters. ' +
                'Current length: ' + (process.env.JWT_SECRET?.length || 0)
            );
        }

        // Ensure HTTPS for frontend URL
        if (process.env.FRONTEND_URL?.startsWith('http://')) {
            throw new Error(
                'PRODUCTION ERROR: FRONTEND_URL must use HTTPS in production. ' +
                'Current: ' + process.env.FRONTEND_URL
            );
        }

        // Validate refresh token expiration is reasonable
        const refreshExpiry = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '604800');
        if (refreshExpiry > 2592000) { // More than 30 days
            logger.warn(
                '⚠️  WARNING: REFRESH_TOKEN_EXPIRATION is longer than 30 days (' +
                Math.floor(refreshExpiry / 86400) + ' days). ' +
                'Consider shortening for better security.'
            );
        }

        logger.log('✅ Production environment validation passed');
    }

    const app = await NestFactory.create(AppModule, {
        rawBody: true, // Enable raw body for Stripe webhook signature verification
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set("trust proxy", 1);

    const allowedOrigins = [process.env.FRONTEND_URL];

    // Add localhost variants for local development
    if (process.env.NODE_ENV === "local") {
        allowedOrigins.push(
            "http://localhost:5173",
            "https://localhost:5173",
        );
    }

    // Add Vercel preview URLs for development environment
    if (process.env.NODE_ENV === "development") {
        if (process.env.VERCEL_URL) {
            allowedOrigins.push(process.env.VERCEL_URL);
        }
    }

    app.enableCors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
        allowedHeaders: [
            "Origin",
            "X-Requested-With",
            "Content-Type",
            "Accept",
            "X-Auth-Token", // Custom header for JWT auth
            "Authorization", // For dev with basic auth
            "Cache-Control",
        ],
        optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    });

    app.use(cookieParser());

    // Apply security headers (Helmet)
    // Note: CSP is disabled for now
    app.use(helmet({
        contentSecurityPolicy: false, // Disabled - requires frontend compatibility testing
        crossOriginEmbedderPolicy: false, // Disabled - may interfere with external embeds
    }));

    // Apply basic auth in local and development environments
    if (process.env.NODE_ENV === "local" || process.env.NODE_ENV === "development") {
        const basicAuthMiddleware = new BasicAuth();
        app.use(basicAuthMiddleware.use.bind(basicAuthMiddleware));
    }


    const config = new DocumentBuilder()
        .setTitle('FighterCenter Swagger API')
        .addApiKey({type: "apiKey", name: 'x-auth-token', in: 'header'}, 'x-auth-token')
        .build();

    if (process.env.NODE_ENV !== 'production') {
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('swagger', app, document);
    }

    await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
