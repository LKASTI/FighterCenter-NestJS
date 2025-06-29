import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import 'reflect-metadata';
import { BasicAuth } from './authentication/basicAuth';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    if(process.env.NODE_ENV === 'development') {
        const basicAuthMiddleware = new BasicAuth();
        app.use(basicAuthMiddleware.use.bind(basicAuthMiddleware));
    }

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL,
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    });

    app.use(cookieParser())

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
