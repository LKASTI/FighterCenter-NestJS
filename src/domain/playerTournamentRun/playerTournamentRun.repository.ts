import { InjectRepository } from "@nestjs/typeorm";
import {
    CreatePlayerTournamentRunDTO,
    FindPlayerTournamentRunsQueryDTO,
} from "src/dtos/playerTournamentRun.dto";
import { PlayerTournamentRun } from "src/domain/entities/playerTournamentRun.entity";
import { Repository } from "typeorm";
import { Player } from "src/domain/entities/player.entity";
import { Tournament } from "src/domain/entities/tournament.entity";
import { NotFoundException } from "@nestjs/common/exceptions/not-found.exception";

export class PlayerTournamentRunRepository extends Repository<PlayerTournamentRun> {
    constructor(
        @InjectRepository(PlayerTournamentRun)
        private repository: Repository<PlayerTournamentRun>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async createAndSave(
        playerTournamentRun: CreatePlayerTournamentRunDTO,
    ): Promise<PlayerTournamentRun> {
        const player = await this.manager
            .getRepository(Player)
            .findOneBy({ playerID: playerTournamentRun.playerID });

        if (!player)
            throw new NotFoundException(
                `Player with playerID ${playerTournamentRun.playerID} not found`,
            );

        const tournament = await this.manager
            .getRepository(Tournament)
            .findOneBy({ tournamentID: playerTournamentRun.tournamentID });

        if (!tournament)
            throw new NotFoundException(
                `Tournament with tournamentID ${playerTournamentRun.tournamentID} not found`,
            );

        const newPlayerTournamentRun = this.create({
            player: player,
            tournament: tournament,
            ...playerTournamentRun,
        });

        return await this.save(newPlayerTournamentRun);
    }

    public async findAllByTournamentID(tournamentID: number) {
        const data = await this.query(
            `
            SELECT
                ptr.player_entry_name,
                ptr.placement,
                ptr.seed,
                ptr.characters_used,
                ptr.player_id
            FROM player_tournament_run AS ptr
            JOIN tournament AS t ON ptr.tournament_id = t.tournament_id
            WHERE t.tournament_id = $1
            ORDER BY ptr.placement ASC
        `,
            [tournamentID],
        );

        return {
            data: data,
            meta: {
                total: data.length,
            },
        };
    }

    public async findAllForSeriesTable(eventID: number) {
        /**
         * SELECT
         *  playerName,
         *  startggProfileImageURL,
         *  country, placementToCount,
         *  attendance,
         *  charactersUsed,
         *  tournaments
         */
        const data = await this.query(
            `
            WITH player_tournaments AS (
                SELECT
                    p.player_id,
                    p.player_entry_name AS player_name,
                    pl.startgg_profile_image_url AS profile_image,
                    pl.country,
                    t.tournament_id,
                    t.tournament_name,
                    t.dates,
                    p.placement,
                    p.characters_used
                FROM
                    tournament t
                        JOIN
                    player_tournament_run p ON t.tournament_id = p.tournament_id
                        JOIN
                    player pl ON p.player_id = pl.player_id
                WHERE
                    t.event_id = $1
            ),
                 player_placement_counts AS (
                     SELECT
                         player_id,
                         placement,
                         COUNT(*) as placement_count
                     FROM
                         player_tournaments
                     GROUP BY
                         player_id, placement
                 ),
                 player_best_placement_info AS (
                     SELECT
                         player_id,
                         MIN(placement) as best_placement,
                         MAX(CASE WHEN placement = (
                             SELECT MIN(placement)
                             FROM player_tournaments pt2
                             WHERE pt2.player_id = pt.player_id
                         ) THEN placement_count ELSE 0 END) as best_placement_count
                     FROM
                         player_tournaments pt
                             JOIN
                         player_placement_counts ppc USING (player_id, placement)
                     GROUP BY
                         player_id
                 ),
                 player_names AS (
                     SELECT
                         player_id,
                         MIN(player_name) AS consistent_player_name,
                         MIN(profile_image) AS consistent_profile_image,
                         MIN(country) AS consistent_country
                     FROM
                         player_tournaments
                     GROUP BY
                         player_id
                 )
            SELECT
                pn.consistent_player_name AS "playerName",
                pn.consistent_profile_image as "startggProfileImageURL",
                pn.consistent_country as "country",
                jsonb_object_agg(
                    ppc.placement::text,
                    ppc.placement_count
                ) AS "placementToCount",
                COUNT(DISTINCT pt.tournament_id) AS "attendance",
                ARRAY(
                    SELECT char
                    FROM (
                             SELECT char, COUNT(*) as usage_count
                             FROM player_tournaments pt2
                                      CROSS JOIN UNNEST(pt2.characters_used) AS char
                             WHERE pt2.player_id = pt.player_id
                               AND pt2.characters_used IS NOT NULL
                             GROUP BY char
                             ORDER BY usage_count DESC, char
                         ) char_counts
                ) AS "charactersUsed",
                (
                    SELECT jsonb_agg(
                               jsonb_build_object(
                                   'tournamentId', pt_sub.tournament_id,
                                   'tournamentName', pt_sub.tournament_name,
                                   'dates', pt_sub.dates,
                                   'placement', pt_sub.placement,
                                   'charactersUsed', pt_sub.characters_used
                               ) ORDER BY pt_sub.dates DESC
                           )
                    FROM (
                             SELECT DISTINCT tournament_id, tournament_name, dates, placement, characters_used
                             FROM player_tournaments pt_inner
                             WHERE pt_inner.player_id = pt.player_id
                         ) pt_sub
                ) AS "tournaments"
            FROM
                player_tournaments pt
                    JOIN
                player_placement_counts ppc ON pt.player_id = ppc.player_id
                    JOIN
                player_names pn ON pt.player_id = pn.player_id
                    JOIN
                player_best_placement_info pbpi ON pt.player_id = pbpi.player_id
            GROUP BY
                pt.player_id,
                pn.consistent_player_name,
                pn.consistent_profile_image,
                pn.consistent_country,
                pbpi.best_placement,
                pbpi.best_placement_count
            ORDER BY
                pbpi.best_placement ASC,  -- Order by best placement
                pbpi.best_placement_count DESC,  -- Then by how many times they got best placement
                COUNT(DISTINCT pt.tournament_id) DESC;  -- Then by attendance
        `,
            [eventID],
        );

        return {
            data: data,
            meta: {
                total: data.length,
            },
        };
    }

    public async findAll(query: FindPlayerTournamentRunsQueryDTO) {
        const queryBuilder = this.createQueryBuilder("playerTournamentRun");
        // console.log(query)
        // Apply filters if provided
        if (query.playerID) {
            queryBuilder.andWhere("playerTournamentRun.playerID = :playerID", {
                playerID: query.playerID,
            });
        }

        if (query.tournamentID) {
            queryBuilder.andWhere(
                "playerTournamentRun.tournamentID = :tournamentID",
                {
                    tournamentID: query.tournamentID,
                },
            );
        }

        if (query.placement) {
            queryBuilder.andWhere(
                "playerTournamentRun.placement = :placement",
                {
                    placement: query.placement,
                },
            );
        }

        if (query.seed) {
            queryBuilder.andWhere("playerTournamentRun.seed = :seed", {
                seed: query.seed,
            });
        }

        if (query.playerEntryName) {
            queryBuilder.andWhere(
                "playerTournamentRun.playerEntryName = :playerEntryName",
                {
                    playerEntryName: query.playerEntryName,
                },
            );
        }

        if (query.charactersUsed) {
            for (const character of query.charactersUsed) {
                queryBuilder.andWhere(
                    ":character = ANY(playerTournamentRun.charactersUsed)",
                    {
                        character: character,
                    },
                );
            }
        }

        // Add sorting
        if (query.sortBy) {
            queryBuilder.orderBy(
                `playerTournamentRun.${query.sortBy}`,
                query.order,
            );
        }

        // Add limit
        queryBuilder.take(query.limit);

        const [playerTournamentRuns, total] =
            await queryBuilder.getManyAndCount();

        return {
            data: playerTournamentRuns,
            meta: {
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }
}
