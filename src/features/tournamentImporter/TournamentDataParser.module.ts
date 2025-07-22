import { Module } from "@nestjs/common";
import { TournamentModule } from "../../domain/tournament/tournament.module";
import { TournamentSetModule } from "../../domain/tournamentSet/tournamentSet.module";
import { TournamentMatchModule } from "../../domain/tournamentMatch/tournamentMatch.module";
import { PlayerModule } from "../../domain/player/player.module";
import { PlayerTournamentRunModule } from "../../domain/playerTournamentRun/playerTournamentRun.module";
import { EventModule } from "../../domain/event/event.module";
import { TournamentDataParserController } from "src/controllers/TournamentDataParser.controller";
import { TournamentDataParserService } from "src/features/tournamentImporter/TournamentDataParser.service";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StartggUserModule } from "../../domain/startggUser/startggUser.module";

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
                    expiresIn: "7d", // Match your cookie expiration
                },
            }),
        }),

        HttpModule,
    ],
    providers: [TournamentDataParserService],
    controllers: [TournamentDataParserController],
    exports: [TournamentDataParserService],
})
export class TournamentDataParserModule {}
