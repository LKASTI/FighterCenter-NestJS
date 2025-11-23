import { Module } from "@nestjs/common";
import { TournamentModule } from "@domain/tournament/tournament.module";
import { TournamentSetModule } from "@domain/tournamentSet/tournamentSet.module";
import { TournamentMatchModule } from "@domain/tournamentMatch/tournamentMatch.module";
import { PlayerModule } from "@domain/player/player.module";
import { PlayerTournamentRunModule } from "@domain/playerTournamentRun/player-tournament-run.module";
import { EventModule } from "@domain/event/event.module";
import { TournamentDataParserController } from "./controllers/tournament-data-parser.controller";
import { TournamentDataParserService } from "./services/tournament-data-parser.service";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StartggUserModule } from "@domain/startggUser/startgg-user.module";
import { EncryptionModule } from "@authentication/encryption/encryption.module";
import { SFSixGamePatchModule } from "@domain/sfsixGamePatch";
import { TournamentManagerService } from "./services/tournament-manager.service";
import { TournamentManagerRepository } from "./repositories/tournament-manager.repository";
import { StartggApiModule } from "@features/startgg-api";
import { PlayerSeriesPerformanceAggModule } from "@domain/playerSeriesPerformanceAgg/playerSeriesPerformanceAgg.module";
import { CommonModule } from "@common/common.module";
import { TournamentGraphicUploadService } from "./services/tournament-graphic-upload.service";
import { R2UploadService } from "@features/twitter-share";
import { TournamentImportAuditLogModule } from "@domain/tournamentImportAuditLog/tournament-import-audit-log.module";
import { TournamentRollbackService } from "./services/tournament-rollback.service";

@Module({
    imports: [
        CommonModule,
        EventModule,
        TournamentModule,
        TournamentSetModule,
        TournamentMatchModule,
        PlayerModule,
        PlayerTournamentRunModule,
        PlayerSeriesPerformanceAggModule,
        TournamentImportAuditLogModule,
        SFSixGamePatchModule,
        StartggUserModule,
        StartggApiModule,
        EncryptionModule,

        PassportModule.register({ defaultStrategy: "jwt" }),
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: {
                    expiresIn: parseInt(
                        configService.get<string>("COOKIE_EXPIRATION_DURATION"),
                    ),
                },
            }),
        }),

        HttpModule,
    ],
    providers: [
        TournamentDataParserService,
        TournamentManagerService,
        TournamentManagerRepository,
        TournamentRollbackService,
        TournamentGraphicUploadService,
        R2UploadService,
    ],
    controllers: [TournamentDataParserController],
    exports: [TournamentDataParserService, TournamentManagerService],
})
export class TournamentDataParserModule {}
