import { PlayerTournamentRunRepository } from "@domain/playerTournamentRun/repositories/player-tournament-run.repository";
import { TournamentSeriesPlayerDto } from "../dtos/response/tournament-series-player.response.dto";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

@Injectable()
export class TournamentSeriesRepository {
    constructor(
        private readonly playerTournamentRunRepository: PlayerTournamentRunRepository,
    ) {}

    public async findPlayersByTournamentId(
        id: number,
    ): Promise<TournamentSeriesPlayerDto[]> {
        const data = await this.playerTournamentRunRepository.query(
            `
                SELECT p.player_id AS "playerID",
                       p.startgg_profile_image_url AS "startggProfileImageURL",
                       p.country AS "country",
                       ptr.player_entry_name AS "playerName",
                       ptr.seed AS "seed",
                       ptr.characters_used AS "charactersUsed",
                       ptr.placement AS "placement"
                FROM player p
                         JOIN player_tournament_run ptr
                              ON p.player_id = ptr.player_id
                WHERE ptr.tournament_id = $1
                ORDER BY ptr.placement;
            `,
            [id],
        );

        return data;
    }

    public async findTopXPlayersByTournamentIds(
        x: number,
        tournamentIds: number[],
    ) {
        const placeholders = tournamentIds
            .map((_, index) => `$${index + 2}`)
            .join(",");
        const data = await this.playerTournamentRunRepository.query(
            `
                SELECT
                    ptr.player_id AS "playerID",
                    ptr.tournament_id AS "tournamentID",
                    ptr.player_entry_name AS "playerName",
                    ptr.seed AS "seed",
                    ptr.characters_used AS "charactersUsed",
                    ptr.placement AS "placement"
                FROM player_tournament_run ptr
                WHERE ptr.placement <= $1
                  AND ptr.tournament_id IN (${placeholders})
                ORDER BY ptr.tournament_id, ptr.placement ASC
                ;
            `,
            [x, ...tournamentIds],
        );

        return data;
    }
}
