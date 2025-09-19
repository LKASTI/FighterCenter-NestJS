import { DataSource, Repository } from "typeorm";
import { PlayerSeriesPerformanceAgg } from "../entities/PlayerSeriesPerformanceAgg.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";


export class PlayerSeriesPerformanceAggRepository extends Repository<PlayerSeriesPerformanceAgg>{
    constructor(
        @InjectRepository(PlayerSeriesPerformanceAgg)
        private readonly repository: Repository<PlayerSeriesPerformanceAgg>,
        @InjectDataSource()
        private dataSource: DataSource,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    async getTournamentsCompetedInIds(playerID: number, eventSeriesID: number): Promise<number[]> {
        const result = await this.query(
            `
            SELECT
                t.tournament_id
            FROM
                tournament AS t
            JOIN
                player_tournament_run AS ptr ON t.tournament_id = ptr.tournament_id
            WHERE
                ptr.player_id = $1
                AND t.event_id = $2
            `,
            [playerID, eventSeriesID]
        );

        return result.data;
    }

    async getAllPlayerIdsInSeries(eventSeriesID: number): Promise<number[]> {
        const result = await this.query(
            `
            SELECT DISTINCT(ptr.player_id) AS "playerId"
            FROM player_tournament_run as ptr
            INNER JOIN tournament t ON t.tournament_id = ptr.tournament_id
            WHERE t.event_id = $1
            `,
            [eventSeriesID]
        );

        return result.map((row) => row.playerId);
    }

    async calculateAndSavePlayerPerformanceAgg(playerID: number, eventSeriesID: number) {
        // Single optimized query with all needed data
        const tournamentData = await this.dataSource.query(
            `
            SELECT 
                ptr.placement,
                ptr.seed,
                ptr.characters_used,
                t.tournament_id,
                t.tournament_name,
                t.dates,
                t.game_patch,
                t.game_season,
                COUNT(*) OVER() as total_tournaments
            FROM player_tournament_run ptr
            INNER JOIN tournament t ON t.tournament_id = ptr.tournament_id
            WHERE ptr.player_id = $1 AND t.event_id = $2
            ORDER BY t.dates DESC
            `,
            [playerID, eventSeriesID]
        );

        const res = await this.dataSource.query(
            `
            SELECT
                pl.country,
                pl.player_name AS "playerName"
            FROM
                player pl
            WHERE
                pl.player_id = $1
            `, [playerID]
        );

        if (tournamentData.length === 0) return;

        // Calculate placements
        const placements = tournamentData.map(t => t.placement);
        const placementCounts = placements.reduce((acc, p) => {
            acc[p.toString()] = (acc[p.toString()] || 0) + 1;
            return acc;
        }, {});

        // Calculate characters
        const allCharacters = new Set();
        tournamentData.forEach(t => {
            if (t.characters_used) {
                t.characters_used.forEach(char => allCharacters.add(char));
            }
        });

        // Single upsert operation
        await this.dataSource.query(
            `
            INSERT INTO player_series_performance_agg (
                player_id, event_id, player_name,
                attendance, placement_to_count, characters_used, 
                tournaments, country, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (player_id, event_id) 
            DO UPDATE SET 
                attendance = EXCLUDED.attendance,
                placement_to_count = EXCLUDED.placement_to_count,
                characters_used = EXCLUDED.characters_used,
                tournaments = EXCLUDED.tournaments,
                updated_at = EXCLUDED.updated_at
            `,
            [
                playerID,
                eventSeriesID,
                res.length > 0 ? res[0].playerName : null,
                tournamentData.length,
                JSON.stringify(placementCounts),
                Array.from(allCharacters),
                JSON.stringify(tournamentData.map(t => ({
                    tournamentId: t.tournament_id,
                    tournamentName: t.tournament_name,
                    dates: t.dates,
                    placement: t.placement,
                    seed: t.seed,
                    charactersUsed: t.characters_used || [],
                    gamePatch: t.game_patch,
                    gameSeason: t.game_season
                }))),
                res.length > 0 ? res[0].country : null
            ]
        );
    }
}