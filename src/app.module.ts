import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PlayerModule } from "@domain/player";
import { SFSixRankedProfileModule } from "@domain/sfsixRankedProfile";
import { SFSixRankedCharacterModule } from "@domain/sfsixRankedCharacter";
import { SfsixRankedCharacterRankingModule } from "@domain/sfsixRankedCharacterRanking";
import { RankedDataParserModule } from "@features/ranked-parser";
import { EventModule } from "@domain/event";
import { TournamentModule } from "@domain/tournament";
import { PlayerTournamentRunModule } from "@domain/playerTournamentRun";
import { TournamentSetModule } from "@domain/tournamentSet";
import { TournamentMatchModule } from "@domain/tournamentMatch";
import { TournamentImportAuditLogModule } from "@domain/tournamentImportAuditLog/tournament-import-audit-log.module";
import { TournamentDataParserModule } from "@features/tournament-importer";
import { HttpModule } from "@nestjs/axios";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { StartggUserModule } from "@domain/startggUser";
import { AuthModule } from "@authentication/auth.module";
import * as Joi from "joi";
import { TournamentSeriesModule } from "@features/tournament-series";
import { EncryptionModule } from "@authentication/encryption/encryption.module";
import { TwitterShareModule } from "@features/twitter-share";
import { StartggApiModule } from "@features/startgg-api";
import { Top8MakerModule } from "@features/top8-maker";
import { SFSixGamePatchModule } from "@domain/sfsixGamePatch";
import {
    PlayerSeriesPerformanceAggModule
} from "@domain/playerSeriesPerformanceAgg/playerSeriesPerformanceAgg.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { CommonModule } from "@common/common.module";
import { PaymentModule } from "@features/payment/payment.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // makes config available throughout the app
            envFilePath: '.env',
            validationSchema: Joi.object({
                STARTGG_CLIENT_ID: Joi.string().required(),
                STARTGG_CLIENT_SECRET: Joi.string().required(),
                STARTGG_CALLBACK_URL: Joi.string().uri().required(),
                JWT_SECRET: Joi.string().min(32).required(),
                FRONTEND_URL: Joi.string().uri().required(),
                NODE_ENV: Joi.string()
                    .valid("development", "production", "local")
                    .default("development"),
                IS_PREVIEW: Joi.boolean().required(),
                // R2 configuration
                CLOUDFLARE_ACCOUNT_ID: Joi.string().required(),
                R2_ACCESS_KEY_ID: Joi.string().required(),
                R2_SECRET_ACCESS_KEY: Joi.string().required(),
                R2_BUCKET_NAME: Joi.string().required(),
                R2_PUBLIC_URL: Joi.string().uri().required(),
                // Stripe configuration
                STRIPE_SECRET_KEY: Joi.string().required(),
                STRIPE_WEBHOOK_SECRET: Joi.string().required(),
                STRIPE_PRICE_ID: Joi.string().required(),
            }),
        }),
        // Throttling
        ThrottlerModule.forRoot([{
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute
        }]),
        // Scheduled Tasks (Cron Jobs)
        ScheduleModule.forRoot(),
        // For serving static images
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "..", "client"),
            serveRoot: "/client",
        }),
        // For configuring database connection
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                maxQueryExecutionTime: 1000,
                host: configService.get("DB_HOST"),
                port: +configService.get<number>("DB_PORT"),
                username: configService.get("DB_USERNAME"),
                password: configService.get("DB_PASSWORD"),
                database: configService.get("DB_NAME"),
                entities: [__dirname + "/**/*.entity{.ts,.js}"],
                synchronize: false,
                logging: process.env.NODE_ENV !== 'production',
                logger: process.env.NODE_ENV === 'production' ? 'advanced-console' : 'debug',
                timezone: "UTC",
            }),
            inject: [ConfigService],
        }),
        // external libraries
        HttpModule,
        // common module
        CommonModule,
        // domain modules
        PlayerModule,
        SFSixRankedProfileModule,
        SFSixRankedCharacterModule,
        SfsixRankedCharacterRankingModule,
        EventModule,
        TournamentModule,
        PlayerTournamentRunModule,
        TournamentSetModule,
        TournamentMatchModule,
        TournamentImportAuditLogModule,
        StartggUserModule,
        TournamentSeriesModule,
        SFSixGamePatchModule,
        PlayerSeriesPerformanceAggModule,
        // data parsing modules
        TournamentDataParserModule,
        RankedDataParserModule,
        // twitter share module
        TwitterShareModule,
        // auth modules
        AuthModule,
        // encryption module
        EncryptionModule,
        // startgg api module
        StartggApiModule,
        // top 8 maker module
        Top8MakerModule,
        // payment module
        PaymentModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: "APP_GUARD",
            useClass: ThrottlerGuard
        }
    ],
})
export class AppModule {}
