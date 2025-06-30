import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TournamentSeriesService } from '../features/tournamentSeries/TournamentSeries.service';

@Controller('tournamentSeries')
export class TournamentSeriesController {
    constructor(private readonly service: TournamentSeriesService) {}

    @Get('findPlayersByTournamentId/:id')
    async findPlayersByTournamentId(@Param('id', ParseIntPipe) id: number) {
        return await this.service.findPlayersByTournamentId(id);
    }
}