import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    ValidationPipe,
} from "@nestjs/common";
import { TournamentSeriesService } from "../features/tournamentSeries/TournamentSeries.service";
import { TournamentSeriesTopXPlayersDTO } from "../features/tournamentSeries/TournamentSeries.dto";

@Controller("tournamentSeries")
export class TournamentSeriesController {
    constructor(private readonly service: TournamentSeriesService) {}

    @Get("findPlayersByTournamentId/:id")
    async findPlayersByTournamentId(@Param("id", ParseIntPipe) id: number) {
        return await this.service.findPlayersByTournamentId(id);
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
