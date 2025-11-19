import { Module } from "@nestjs/common";
import { TournamentModule } from "../../domain/tournament/tournament.module";
import { TournamentSetModule } from "../../domain/tournamentSet/tournamentSet.module";
import { TournamentMatchModule } from "../../domain/tournamentMatch/tournamentMatch.module";
import { PlayerModule } from "../../domain/player/player.module";
import { PlayerTournamentRunModule } from "../../domain/playerTournamentRun/player-tournament-run.module";
import { EventModule } from "../../domain/event/event.module";
import { TournamentDataParserController } from "@features/tournament-importer";
import { TournamentDataParserService } from "@features/tournament-importer";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StartggUserModule } from "../../domain/startggUser/startgg-user.module";

@Module({
    imports: [
        EventModule,
        TournamentModule,
        TournamentSetModule,
        TournamentMatchModule,
        PlayerModule,
        PlayerTournamentRunModule,
        StartggUserModule,

        PassportModule.register({ defaultStrategy: "jwt" }),
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

        HttpModule,
    ],
    providers: [TournamentDataParserService],
    controllers: [TournamentDataParserController],
    exports: [TournamentDataParserService],
})
export class TournamentSeriesImporterModule {}
