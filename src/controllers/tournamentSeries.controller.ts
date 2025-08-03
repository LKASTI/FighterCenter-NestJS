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
import { TournamentService } from "../domain/tournament/tournament.service";
import { Tournament } from "../domain/entities";

@Controller("tournamentSeries")
export class TournamentSeriesController {
    constructor(
        private readonly service: TournamentSeriesService,
        private readonly tournamentService: TournamentService
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
        const { eventSeriesIds = [] } = query;
        const tournaments: Tournament [] = [];
        if( eventSeriesIds.length > 0) {
            for(let i = 0; i < eventSeriesIds.length; i++) {
                const eventSeriesId = parseInt(eventSeriesIds[i]);
                try {
                    const res = await this.tournamentService.findAll({
                        eventID: eventSeriesId,
                        order: "DESC",
                        sortBy: "dates",
                        limit: 1
                    })
                    if (res.data && res.data.length > 0) {
                        tournaments.push(res.data[0]);
                    }
                } catch (error) {
                    console.error(`Error fetching tournaments for event series ID ${eventSeriesId}:`, error);
                    return {
                        data: []
                    }
                }
            }
        }
        return {
            data: tournaments
        }
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
