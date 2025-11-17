import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import "reflect-metadata";
import { BasicAuth } from "./authentication/basicAuth";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
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

    // Apply basic auth in local and development environments
    if (process.env.NODE_ENV === "local" || process.env.NODE_ENV === "development") {
        const basicAuthMiddleware = new BasicAuth();
        app.use(basicAuthMiddleware.use.bind(basicAuthMiddleware));
    }


    const config = new DocumentBuilder()
        .setTitle('FighterCenter Swagger API')
        .addApiKey({type: "apiKey", name: 'x-auth-token', in: 'header'}, 'x-auth-token')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
