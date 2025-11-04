import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post, Query,
    ValidationPipe,
} from "@nestjs/common";
import { TournamentSeriesService } from "../features/tournamentSeries/tournamentSeries.service";
import {
    FindLatestTournamentsQueryDTO,
    TournamentSeriesTopXPlayersDTO,
} from "../features/tournamentSeries/tournamentSeries.dto";

@Controller("tournamentSeries")
export class TournamentSeriesController {
    constructor(
        private readonly service: TournamentSeriesService,
    ) {}

    @Get("findPlayersByTournamentId/:id")
    async findPlayersByTournamentId(@Param("id", ParseIntPipe) id: number) {
        return await this.service.findPlayersByTournamentId(id);
    }

    @Get("findLatestTournamentsByEventSeriesIds")
    async findLatestTournaments(
        @Query(new ValidationPipe({ transform: true }))
        query: FindLatestTournamentsQueryDTO,
    ) {
        return await this.service.findLatestTournaments(query);
    }

    @Post("findTopXPlayersByTournamentIds")
    async findTopXPlayersByTournamentIds(
        @Body(new ValidationPipe({ transform: true }))
        tournamentSeriesTopXPlayersDTO: TournamentSeriesTopXPlayersDTO,
    ) {
        return await this.service.findTopXPlayersByTournamentIds(
            tournamentSeriesTopXPlayersDTO.x,
            tournamentSeriesTopXPlayersDTO.tournamentIDs,
        );
    }
}
