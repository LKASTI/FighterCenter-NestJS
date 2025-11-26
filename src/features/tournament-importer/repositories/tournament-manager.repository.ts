import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Logger } from "@nestjs/common";

export class TournamentManagerRepository {
    private readonly logger = new Logger(TournamentManagerRepository.name);

    constructor(
        @InjectDataSource()
        private dataSource: DataSource
    ) {}

    public async deleteTournamentData(tournamentId: number) {
        try {
            return this.dataSource.transaction(async (manager) => {

                // Delete matches
                await manager.query(
                    `
                        DELETE FROM tournament_match
                        USING tournament_set
                        WHERE tournament_match.tournament_set_id = tournament_set.tournament_set_id
                          AND tournament_set.tournament_id = $1;
                    `,
                    [tournamentId],
                );

                // Delete sets
                await manager.query(
                    `
                        DELETE FROM 
                        tournament_set ts
                        WHERE ts.tournament_id = $1;
                    `,
                    [tournamentId]
                )

                // Delete player tournament runs
                await manager.query(
                    `
                        DELETE FROM
                        player_tournament_run ptr
                        WHERE ptr.tournament_id = $1;
                    `,
                    [tournamentId]
                )

                // Delete tournament
                await manager.query(
                    `
                        DELETE FROM
                        tournament t
                        WHERE t.tournament_id = $1;
                    `,
                    [tournamentId]
                )

                return {
                    data: true
                };
            })
        } catch (error) {
            this.logger.error("Error deleting tournament data:", error);
            throw error;
        }
    }

}