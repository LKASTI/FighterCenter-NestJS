import { InjectRepository } from "@nestjs/typeorm";
import { TournamentImportAuditLog } from "@domain/entities/tournamentImportAuditLog.entity";
import { Repository } from "typeorm";

export class TournamentImportAuditLogRepository extends Repository<TournamentImportAuditLog> {
    constructor(
        @InjectRepository(TournamentImportAuditLog)
        private repository: Repository<TournamentImportAuditLog>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    /**
     * Create and save an audit log entry
     */
    public async createAndSave(
        data: Partial<TournamentImportAuditLog>,
    ): Promise<TournamentImportAuditLog> {
        const auditLog = this.create(data);
        return await this.save(auditLog);
    }

    /**
     * Find all audit logs for a specific tournament series
     */
    public async findByTournamentSeriesId(
        tournamentSeriesId: number,
    ): Promise<TournamentImportAuditLog[]> {
        return await this.find({
            where: { tournamentSeriesId },
            order: { startTime: "DESC" },
        });
    }

    /**
     * Find failed import attempts for a tournament series
     */
    public async findFailedImports(
        tournamentSeriesId: number,
    ): Promise<TournamentImportAuditLog[]> {
        return await this.find({
            where: [
                { tournamentSeriesId, status: "failed" },
                { tournamentSeriesId, status: "rolled_back" },
            ],
            order: { startTime: "DESC" },
        });
    }

    /**
     * Find the most recent audit log for a tournament series
     */
    public async findMostRecent(
        tournamentSeriesId: number,
    ): Promise<TournamentImportAuditLog | null> {
        return await this.findOne({
            where: { tournamentSeriesId },
            order: { startTime: "DESC" },
        });
    }
}
