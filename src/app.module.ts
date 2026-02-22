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
import { AuthModule } from "@authentication/auth.module";
import { NoteBookModule } from "@features/noteBook/noteBook.module";
import { TechLibraryModule } from "@features/techLibrary/techLibrary.module";
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
import { BucklerModule } from "@features/buckler";
import { RankedScraperModule } from "@features/ranked-scraper";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // makes config available throughout the app
            envFilePath: '.env',
            validationSchema: Joi.object({
                JWT_SECRET: Joi.string().min(32).required(),
                FRONTEND_URL: Joi.string().uri().required(),
                NODE_ENV: Joi.string()
                    .valid("development", "production", "local")
                    .default("development"),
                IS_PREVIEW: Joi.boolean().required(),
                // Auth Service
                AUTH_SERVICE_URL: Joi.string().uri().required(),
                AUTH_SERVICE_API_KEY: Joi.string().min(32).required(),
                // R2 configuration
                CLOUDFLARE_ACCOUNT_ID: Joi.string().required(),
                R2_IMAGES_BUCKET_NAME: Joi.string().required(),
                R2_IMAGES_ACCESS_KEY_ID: Joi.string().required(),
                R2_IMAGES_SECRET_ACCESS_KEY: Joi.string().required(),
                R2_IMAGES_PUBLIC_URL: Joi.string().uri().required(),
                R2_TIERLIST_BUCKET_NAME: Joi.string().required(),
                R2_TIERLIST_ACCESS_KEY_ID: Joi.string().required(),
                R2_TIERLIST_SECRET_ACCESS_KEY: Joi.string().required(),
                R2_TIERLIST_PUBLIC_URL: Joi.string().uri().required(),
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
                ssl: process.env.NODE_ENV === 'production' ? {
                    rejectUnauthorized: false,
                } : false,
                extra: {
                    max: 20,                       // Maximum pool size
                    min: 2,                        // Minimum pool size (lower = less pressure on reconnect storms)
                    idleTimeoutMillis: 30000,      // Close idle connections after 30s
                    connectionTimeoutMillis: 10000, // Connection acquisition timeout (10s for cloud networking)
                    keepAlive: true,               // Detect dead connections via TCP keep-alive
                    keepAliveInitialDelayMillis: 10000, // Start keep-alive probes after 10s idle
                },
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
        TournamentSeriesModule,
        SFSixGamePatchModule,
        PlayerSeriesPerformanceAggModule,
        // user data modules
        NoteBookModule,
        TechLibraryModule,
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
        PaymentModule,
        // buckler infrastructure (shared scraper services)
        BucklerModule,
        // ranked data scraper (daily cron job)
        RankedScraperModule
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
