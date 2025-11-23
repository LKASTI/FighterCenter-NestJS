import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { TournamentImportContext } from "../types/tournament-import-context";
import { TournamentMatch } from "@domain/entities/tournamentMatch.entity";
import { TournamentSet } from "@domain/entities/tournamentSet.entity";
import { PlayerTournamentRun } from "@domain/entities/playerTournamentRun.entity";
import { Tournament } from "@domain/entities/tournament.entity";
import { Event } from "@domain/entities/event.entity";
import { TournamentImportAuditLogService } from "@domain/tournamentImportAuditLog/services/tournament-import-audit-log.service";

/**
 * Service responsible for rolling back tournament imports that fail mid-process.
 * Deletes all entities created during the import in the correct dependency order.
 */
@Injectable()
export class TournamentRollbackService {
    private readonly logger = new Logger(TournamentRollbackService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly auditLogService: TournamentImportAuditLogService,
    ) {}

    /**
     * Rolls back a failed tournament import by deleting all created entities.
     * Uses a single transaction to ensure atomic cleanup.
     *
     * @param context - The import context tracking all created entities
     * @param error - The error that caused the import to fail
     */
    async rollbackImport(
        context: TournamentImportContext,
        error: Error,
    ): Promise<void> {
        context.importStatus = "failed";
        context.endTime = new Date();

        this.logger.warn(
            `Rolling back import for tournament series ${context.eventId} due to error: ${error.message}`,
        );

        try {
            // Perform all deletions in a single transaction for atomicity
            await this.dataSource.transaction(async (manager) => {
                // Delete in reverse dependency order to avoid foreign key violations

                // 1. Delete TournamentMatches (depends on TournamentSet)
                if (context.matchIds.length > 0) {
                    const matchDeleteResult = await manager.delete(
                        TournamentMatch,
                        context.matchIds,
                    );
                    this.logger.log(
                        `Deleted ${matchDeleteResult.affected} tournament matches`,
                    );
                }

                // 2. Delete TournamentSets (depends on PlayerTournamentRun and Tournament)
                if (context.setIds.length > 0) {
                    const setDeleteResult = await manager.delete(
                        TournamentSet,
                        context.setIds,
                    );
                    this.logger.log(
                        `Deleted ${setDeleteResult.affected} tournament sets`,
                    );
                }

                // 3. Delete PlayerTournamentRuns (depends on Player and Tournament)
                if (context.ptrKeys.length > 0) {
                    const ptrDeleteResult = await manager.delete(
                        PlayerTournamentRun,
                        context.ptrKeys,
                    );
                    this.logger.log(
                        `Deleted ${ptrDeleteResult.affected} player tournament runs`,
                    );
                }

                // 4. Delete Tournament (depends on Event)
                if (context.tournamentId) {
                    const tournamentDeleteResult = await manager.delete(
                        Tournament,
                        { tournamentID: context.tournamentId },
                    );
                    this.logger.log(
                        `Deleted ${tournamentDeleteResult.affected} tournament`,
                    );
                }

                // 5. Delete Event ONLY if we created it (not if it was reused)
                if (context.eventWasCreated && context.eventId) {
                    const eventDeleteResult = await manager.delete(Event, {
                        eventID: context.eventId,
                    });
                    this.logger.log(
                        `Deleted ${eventDeleteResult.affected} event (was newly created)`,
                    );
                } else if (context.eventId) {
                    this.logger.log(
                        `Skipped deleting event ${context.eventId} (was reused from existing)`,
                    );
                }

                // 6. Players are NOT deleted (reusable entities across tournaments)
                if (context.playerIds.size > 0) {
                    this.logger.log(
                        `Preserved ${context.playerIds.size} players (reusable entities)`,
                    );
                }
            });

            this.logger.log(
                `Rollback successful for tournament series ${context.eventId}`,
            );
        } catch (rollbackError) {
            // If rollback itself fails, log the error but don't throw
            // We want to continue to audit log creation
            this.logger.error(
                `Rollback failed for tournament series ${context.eventId}`,
                rollbackError.stack,
            );
        }

        // Create audit log entry (separate try/catch - don't fail rollback if this fails)
        try {
            await this.auditLogService.create({
                tournamentSeriesId: context.eventId,
                status: "rolled_back",
                errorMessage: error.message,
                errorStack: error.stack,
                createdEntities: context.getSummary(),
                startTime: context.startTime,
                endTime: context.endTime,
                durationMs: context.getDurationMs(),
            });
            this.logger.log(
                `Created audit log for failed import of tournament series ${context.eventId}`,
            );
        } catch (auditError) {
            // Log the error but don't throw - rollback already happened
            this.logger.error(
                `Failed to create audit log for tournament series ${context.eventId}`,
                auditError.stack,
            );
        }
    }
}
