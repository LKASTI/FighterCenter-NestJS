

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlayerSeriesPerformanceAgg } from "../entities/PlayerSeriesPerformanceAgg.entity";
import { PlayerSeriesPerformanceAggService } from "./playerSeriesPerformanceAgg.service";
import { PlayerSeriesPerformanceAggRepository } from "./playerSeriesPerformanceAgg.repository";
import { PlayerSeriesPerformanceAggController } from "../../controllers/playerSeriesPerformanceAgg.controller";
import { EventModule } from "../event/event.module";
import { EncryptionModule } from "../../authentication/encryption/encryption.module";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { StartggApiModule } from "@features/startgg-api";
import { TournamentMatchModule } from "../tournamentMatch/tournamentMatch.module";
import { TournamentSetModule } from "../tournamentSet/tournamentSet.module";
import { CommonModule } from "../../common/common.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([PlayerSeriesPerformanceAgg]),
        EventModule,
        TournamentMatchModule,
        TournamentSetModule,

        EncryptionModule,
        CommonModule,
        StartggApiModule,
        PassportModule.register({ defaultStrategy: "jwt" }),
        ConfigModule.forRoot(), // Make sure this is included to load environment variables
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: {
                    expiresIn: parseInt(
                        configService.get<string>("COOKIE_EXPIRATION_DURATION"),
                    ), // Match your cookie expiration
                },
            }),
        }),
    ],
    providers: [PlayerSeriesPerformanceAggService, PlayerSeriesPerformanceAggRepository],
    controllers: [PlayerSeriesPerformanceAggController],
    exports: [PlayerSeriesPerformanceAggService, PlayerSeriesPerformanceAggRepository],
})
export class PlayerSeriesPerformanceAggModule {}
