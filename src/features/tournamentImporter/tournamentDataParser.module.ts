import { Module } from "@nestjs/common";
import { TournamentModule } from "../../domain/tournament/tournament.module";
import { TournamentSetModule } from "../../domain/tournamentSet/tournamentSet.module";
import { TournamentMatchModule } from "../../domain/tournamentMatch/tournamentMatch.module";
import { PlayerModule } from "../../domain/player/player.module";
import { PlayerTournamentRunModule } from "../../domain/playerTournamentRun/playerTournamentRun.module";
import { EventModule } from "../../domain/event/event.module";
import { TournamentDataParserController } from "src/controllers/tournamentDataParser.controller";
import { TournamentDataParserService } from "src/features/tournamentImporter/tournamentDataParser.service";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StartggUserModule } from "../../domain/startggUser/startggUser.module";
import { EncryptionModule } from "../../authentication/encryption/encryption.module";
import { SFSixGamePatchModule } from "../../domain/sfsixGamePatch/sfsixGamePatch.module";
import { TournamentManagerService } from "./tournamentManager.service";
import { TournamentManagerRepository } from "./tournamentManager.repository";

@Module({
    imports: [
        EventModule,
        TournamentModule,
        TournamentSetModule,
        TournamentMatchModule,
        PlayerModule,
        PlayerTournamentRunModule,
        SFSixGamePatchModule,
        StartggUserModule,
        EncryptionModule,

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

        HttpModule,
    ],
    providers: [TournamentDataParserService, TournamentManagerService, TournamentManagerRepository],
    controllers: [TournamentDataParserController],
    exports: [TournamentDataParserService, TournamentManagerService],
})
export class TournamentDataParserModule {}
