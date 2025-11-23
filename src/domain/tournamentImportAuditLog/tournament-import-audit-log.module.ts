import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TournamentImportAuditLog } from "@domain/entities/tournamentImportAuditLog.entity";
import { TournamentImportAuditLogService } from "./services/tournament-import-audit-log.service";
import { TournamentImportAuditLogRepository } from "./repositories/tournament-import-audit-log.repository";

@Module({
    imports: [TypeOrmModule.forFeature([TournamentImportAuditLog])],
    providers: [TournamentImportAuditLogService, TournamentImportAuditLogRepository],
    exports: [TournamentImportAuditLogService],
})
export class TournamentImportAuditLogModule {}
