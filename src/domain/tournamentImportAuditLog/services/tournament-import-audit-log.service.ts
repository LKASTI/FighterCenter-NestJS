import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { TournamentImportAuditLog } from "@domain/entities/tournamentImportAuditLog.entity";
import { TournamentImportAuditLogRepository } from "../repositories/tournament-import-audit-log.repository";

@Injectable()
export class TournamentImportAuditLogService {
    constructor(
        @InjectRepository(TournamentImportAuditLogRepository)
        private readonly auditLogRepository: TournamentImportAuditLogRepository,
    ) {}

    /**
     * Create a new audit log entry
     */
    public async create(
        data: Partial<TournamentImportAuditLog>,
    ): Promise<TournamentImportAuditLog> {
        return await this.auditLogRepository.createAndSave(data);
    }

    /**
     * Find all audit logs for a specific tournament series
     */
    public async findByTournamentSeriesId(
        tournamentSeriesId: number,
    ): Promise<TournamentImportAuditLog[]> {
        return await this.auditLogRepository.findByTournamentSeriesId(
            tournamentSeriesId,
        );
    }

    /**
     * Find failed import attempts for a tournament series
     */
    public async findFailedImports(
        tournamentSeriesId: number,
    ): Promise<TournamentImportAuditLog[]> {
        return await this.auditLogRepository.findFailedImports(
            tournamentSeriesId,
        );
    }

    /**
     * Find the most recent audit log for a tournament series
     */
    public async findMostRecent(
        tournamentSeriesId: number,
    ): Promise<TournamentImportAuditLog | null> {
        return await this.auditLogRepository.findMostRecent(tournamentSeriesId);
    }
}
