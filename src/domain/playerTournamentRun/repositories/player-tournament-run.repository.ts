import { InjectRepository } from "@nestjs/typeorm";
import {
    CreatePlayerTournamentRunDto,
    FindPlayerTournamentRunsQueryDto
} from "../dtos/request";
import { PlayerTournamentRun } from "@entities/playerTournamentRun.entity";
import { Repository } from "typeorm";
import { Player } from "@entities/player.entity";
import { Tournament } from "@entities/tournament.entity";
import { NotFoundException } from "@nestjs/common/exceptions/not-found.exception";
import { SeriesDataTableDataQuery } from "../queries/series-data-table.query";

export class PlayerTournamentRunRepository extends Repository<PlayerTournamentRun> {
    constructor(
        @InjectRepository(PlayerTournamentRun)
        private repository: Repository<PlayerTournamentRun>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async createAndSave(
        playerTournamentRun: CreatePlayerTournamentRunDto,
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
            SeriesDataTableDataQuery,
            [eventID],
        );

        return {
            data: data,
            meta: {
                total: data.length,
            },
        };
    }

    public async findAll(query: FindPlayerTournamentRunsQueryDto) {
        const queryBuilder = this.createQueryBuilder("playerTournamentRun");
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
