import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import "reflect-metadata";
import { BasicAuth } from "@authentication/basicAuth";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter } from "@common/filters/global-exception.filter";

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    logger.log("proxy: ", process.env.IS_PREVIEW)
    // Production environment validation
    if (process.env.NODE_ENV === 'production') {
        const jwtSecret = process.env.JWT_SECRET;

        // Validate JWT secret strength
        if (!jwtSecret || jwtSecret.length < 32) {
            throw new Error(
                'PRODUCTION ERROR: JWT_SECRET must be at least 32 characters. ' +
                'Current length: ' + (jwtSecret?.length || 0)
            );
        }

        // Check for weak patterns
        if (/^(.)\1+$/.test(jwtSecret)) { // All same character (e.g., "aaaaa...")
            throw new Error('JWT_SECRET must not be a repeated character');
        }

        if (/^(012|123|234|345|456|567|678|789|abc|bcd|cde|def)/i.test(jwtSecret)) { // Sequential characters
            throw new Error('JWT_SECRET contains sequential characters - use cryptographically random bytes');
        }

        if (/^(password|secret|default|test|admin|user|1234)/i.test(jwtSecret)) { // Common weak passwords
            throw new Error('JWT_SECRET contains common weak patterns - use cryptographically random bytes');
        }

        // Check character diversity (ensure it's not too uniform)
        const uniqueChars = new Set(jwtSecret).size;
        if (uniqueChars < 16) { // Less than 16 unique characters in a 32+ char string
            throw new Error(
                'JWT_SECRET has insufficient character diversity (' + uniqueChars + ' unique chars). ' +
                'Use crypto.randomBytes(32).toString(\'hex\') to generate a strong secret'
            );
        }

        // Warn about best practices
        logger.log('✅ JWT_SECRET validation passed');
        logger.warn(
            '⚠️  Security reminder: Ensure JWT_SECRET was generated using crypto.randomBytes(32).toString(\'hex\') ' +
            'or equivalent cryptographically secure random generator'
        );

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
        bodyParser: true, // Enable body parser (required for rawBody to work)
    });

    // Global exception filter for error message sanitization
    app.useGlobalFilters(new GlobalExceptionFilter());

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

    // Add Vercel URLs for non-production environments
    if (process.env.NODE_ENV !== "production") {
        if (process.env.VERCEL_URL) {
            const vercelUrl = process.env.VERCEL_URL;

            // Validate URL format
            try {
                const url = new URL(vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`);
                const hostname = url.hostname;

                // Verify it's a Vercel preview domain (.vercel.app)
                if (hostname.endsWith('.vercel.app')) {
                    allowedOrigins.push(url.origin);
                    logger.log(`✅ Added Vercel preview URL to CORS: ${url.origin}`);
                } else {
                    logger.warn(
                        `⚠️  WARNING: VERCEL_URL (${vercelUrl}) is not a Vercel preview domain (.vercel.app). ` +
                        'Skipping CORS addition for security. Use FRONTEND_URL for custom domains.'
                    );
                }
            } catch (error) {
                logger.warn(
                    `⚠️  WARNING: Invalid VERCEL_URL format (${vercelUrl}). ` +
                    'Must be a valid URL. Skipping CORS addition.'
                );
            }
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
