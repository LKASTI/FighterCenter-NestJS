import { InjectRepository } from "@nestjs/typeorm";
import {
    CreateTournamentSetDTO,
    FindTournamentSetsQueryDTO,
} from "src/dtos/tournamentSet.dto";
import { TournamentSet } from "src/domain/entities/tournamentSet.entity";
import { Repository } from "typeorm";
import { Player } from "src/domain/entities/player.entity";
import { Tournament } from "src/domain/entities/tournament.entity";
import { NotFoundException } from "@nestjs/common/exceptions/not-found.exception";
import { totalmem } from "os";

export class TournamentSetRepository extends Repository<TournamentSet> {
    constructor(
        @InjectRepository(TournamentSet)
        private repository: Repository<TournamentSet>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async createAndSave(
        tournamentSet: CreateTournamentSetDTO,
    ): Promise<TournamentSet> {
        const playerOne = await this.manager
            .getRepository(Player)
            .findOneBy({ playerID: tournamentSet.playerOneID });

        if (!playerOne)
            throw new NotFoundException(
                `Player with playerID ${tournamentSet.playerOneID} not found`,
            );

        const playerTwo = await this.manager
            .getRepository(Player)
            .findOneBy({ playerID: tournamentSet.playerTwoID });

        if (!playerTwo)
            throw new NotFoundException(
                `Player with playerID ${tournamentSet.playerTwoID} not found`,
            );

        const tournament = await this.manager
            .getRepository(Tournament)
            .findOneBy({ tournamentID: tournamentSet.tournamentID });

        if (!tournament)
            throw new NotFoundException(
                `Tournament with tournamentID ${tournamentSet.tournamentID} not found`,
            );

        const newTournamentSet = this.create({
            tournamentID: tournamentSet.tournamentID,
            playerOneID: tournamentSet.playerOneID,
            playerTwoID: tournamentSet.playerTwoID,
            matchesToWin: tournamentSet.matchesToWin,
            bracketName: tournamentSet.bracketName,
            bracketRound: tournamentSet.bracketRound,
            winnerName: tournamentSet.winnerName,
            winnerID: tournamentSet.winnerID,
        });

        return await this.save(newTournamentSet);
    }

    public async findAllByTournamentID(tournamentID: number) {
        const data = await this.query(
            `
            SELECT
                ts.tournament_set_id,
                ts.bracket_name,
                ts.bracket_round,
                ts.winner_name,
                ts.winner_id,
                p1.player_entry_name as player_one_name,
                p2.player_entry_name as player_two_name,
                p1.player_id as player_one_id,
                p2.player_id as player_two_id
            FROM tournament_set AS ts
            JOIN tournament AS t ON ts.tournament_id = t.tournament_id
            JOIN player_tournament_run p1 ON ts.player_one_id = p1.player_id
                AND ts.tournament_id = p1.tournament_id
            JOIN player_tournament_run p2 ON ts.player_two_id = p2.player_id
                AND ts.tournament_id = p2.tournament_id
            WHERE t.tournament_id = $1
            ORDER BY
                ts.bracket_name DESC,
                ts.bracket_round ASC;
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

    public async findAll(query: FindTournamentSetsQueryDTO) {
        const queryBuilder = this.createQueryBuilder("tournamentSet");

        // Apply filters if provided
        if (query.tournamentID) {
            queryBuilder.andWhere(
                "tournamentSet.tournamentID = :tournamentID",
                {
                    tournamentID: query.tournamentID,
                },
            );
        }

        if (query.playerOneID) {
            queryBuilder.andWhere("tournamentSet.playerOneID = :playerOneID", {
                playerOneID: query.playerOneID,
            });
        }

        if (query.playerTwoID) {
            queryBuilder.andWhere("tournamentSet.playerTwoID = :playerTwoID", {
                playerTwoID: query.playerTwoID,
            });
        }

        if (query.bracketName) {
            queryBuilder.andWhere("tournamentSet.bracketName = :bracketName", {
                bracketName: query.bracketName,
            });
        }

        if (query.bracketRound) {
            queryBuilder.andWhere(
                "tournamentSet.bracketRound = :bracketRound",
                {
                    bracketRound: query.bracketRound,
                },
            );
        }

        if (query.matchesToWin) {
            queryBuilder.andWhere(
                "tournamentSet.matchesToWin = :matchesToWin",
                {
                    matchesToWin: query.matchesToWin,
                },
            );
        }

        if (query.winnerID) {
            queryBuilder.andWhere("tournamentSet.winnerID = :winnerID", {
                winnerID: query.winnerID,
            });
        }

        if (query.winnerName) {
            queryBuilder.andWhere("tournamentSet.winnerName = :winnerName", {
                winnerName: query.winnerName,
            });
        }

        // Add sorting
        if (query.sortBy) {
            queryBuilder.orderBy(`tournamentSet.${query.sortBy}`, query.order);
        }

        // Add limit
        queryBuilder.take(query.limit);

        const [tournamentSets, count] = await queryBuilder.getManyAndCount();

        return {
            data: tournamentSets,
            meta: {
                limit: query.limit,
                total: count,
            },
        };
    }
}
