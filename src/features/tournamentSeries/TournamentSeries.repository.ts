import { PlayerTournamentRunRepository } from '../../domain/playerTournamentRun/playerTournamentRun.repository';
import { TournamentSeriesPlayerDTO } from './TournamentSeries.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TournamentSeriesRepository {
    constructor(

        private readonly playerTournamentRunRepository: PlayerTournamentRunRepository,

    ) {}

    public async findPlayersByTournamentId(id: number): Promise<TournamentSeriesPlayerDTO> {
        const data = await this.playerTournamentRunRepository.query(
            `
                SELECT p.player_id,
                       p.startgg_profile_image_url,
                       p.country,
                       ptr.player_entry_name,
                       ptr.seed,
                       ptr.characters_used,
                       ptr.placement
                FROM player p
                         JOIN player_tournament_run ptr
                              ON p.player_id = ptr.player_id
                WHERE ptr.tournament_id = $1
                ORDER BY ptr.placement;
            `,
            [id]
        );

        return data;
    }
}