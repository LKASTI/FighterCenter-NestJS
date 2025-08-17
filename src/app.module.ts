import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PlayerModule } from "./domain/player/player.module";
import { SFSixRankedProfileModule } from "./domain/sfsixRankedProfile/sfsixRankedProfile.module";
import { SFSixRankedCharacterModule } from "./domain/sfsixRankedCharacter/sfsixRankedCharacter.module";
import { SFSixRankedCharacterRankingModule } from "./domain/sfsixRankedCharacterRanking/sfsixRankedCharacterRanking.module";
import { RankedDataParserModule } from "./features/rankedParser/rankedDataParser.module";
import { EventModule } from "./domain/event/event.module";
import { TournamentModule } from "./domain/tournament/tournament.module";
import { PlayerTournamentRunModule } from "./domain/playerTournamentRun/playerTournamentRun.module";
import { TournamentSetModule } from "./domain/tournamentSet/tournamentSet.module";
import { TournamentMatchModule } from "./domain/tournamentMatch/tournamentMatch.module";
import { TournamentDataParserModule } from "./features/tournamentImporter/tournamentDataParser.module";
import { HttpModule } from "@nestjs/axios";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { StartggUserModule } from "./domain/startggUser/startggUser.module";
import { AuthModule } from "./authentication/auth.module";
import * as Joi from "joi";
import { TournamentSeriesModule } from "./features/tournamentSeries/tournamentSeries.module";
import { EncryptionModule } from "./authentication/encryption/encryption.module";
import { TwitterShareModule } from "./domain/twitterShare/twitterShare.module";
import { StartggApiModule } from "./features/startggApi/startggApi.module";
import { Top8MakerModule } from "./features/top8maker/top8maker.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // makes config available throughout the app
            validationSchema: Joi.object({
                STARTGG_CLIENT_ID: Joi.string().required(),
                STARTGG_CLIENT_SECRET: Joi.string().required(),
                STARTGG_CALLBACK_URL: Joi.string().uri().required(),
                JWT_SECRET: Joi.string().min(32).required(),
                FRONTEND_URL: Joi.string().uri().required(),
                NODE_ENV: Joi.string()
                    .valid("development", "production", "test")
                    .default("development"),
            }),
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "client"),
            serveRoot: "/client",
        }),
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
                synchronize: false, //TODO: set to false in production
                logging: true,
                logger: "debug",
                timezone: "UTC",
            }),
            inject: [ConfigService],
        }),
        // external libraries
        HttpModule,
        // domain modules
        PlayerModule,
        SFSixRankedProfileModule,
        SFSixRankedCharacterModule,
        SFSixRankedCharacterRankingModule,
        EventModule,
        TournamentModule,
        PlayerTournamentRunModule,
        TournamentSetModule,
        TournamentMatchModule,
        StartggUserModule,
        TournamentSeriesModule,
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
        Top8MakerModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
