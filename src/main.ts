import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import 'reflect-metadata';
import { BasicAuth } from './authentication/basicAuth';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    const allowedOrigins = [
        process.env.FRONTEND_URL,
    ];

    // Add localhost variants for development
    if (process.env.NODE_ENV === 'development') {
        allowedOrigins.push(
            'http://localhost:5173',
            'https://localhost:5173',
        );
    }

    app.enableCors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Cache-Control'
        ],
        optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    });

    app.use(cookieParser())

    if(process.env.NODE_ENV === 'development') {
        const basicAuthMiddleware = new BasicAuth();
        app.use(basicAuthMiddleware.use.bind(basicAuthMiddleware));
    }

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
