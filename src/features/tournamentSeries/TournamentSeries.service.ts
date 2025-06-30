import { Inject, Injectable } from '@nestjs/common';
import { TournamentSeriesPlayerDTO } from './TournamentSeries.dto';
import { TournamentSeriesRepository } from './TournamentSeries.repository';


@Injectable()
export class TournamentSeriesService {
    constructor(

        @Inject()
        private readonly tournamentSeriesRepository: TournamentSeriesRepository
    ) {}

    public async findPlayersByTournamentId(id: number): Promise<TournamentSeriesPlayerDTO []> {
        return await this.tournamentSeriesRepository.findPlayersByTournamentId(id);
    }

    public async findTopXPlayersByTournamentIds(x: number, tournamentIDs: number[]): Promise<TournamentSeriesPlayerDTO[]> {
        return await this.tournamentSeriesRepository.findTopXPlayersByTournamentIds(x, tournamentIDs);
    }
}