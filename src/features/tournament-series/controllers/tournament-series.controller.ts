import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    ValidationPipe,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TournamentSeriesService } from "../services/tournament-series.service";
import {
    FindLatestTournamentsQueryDto
} from "../dtos/request/find-latest-tournaments-query.dto";
import { FindTopXPlayersDto } from "../dtos/request/find-top-x-players.dto";
import {
    ApiTournamentSeriesGet,
    ApiTournamentSeriesGetById,
    ApiTournamentSeriesPost
} from "../decorators/tournament-series-swagger.decorators";
import { TournamentSeriesPlayerDto } from "../dtos/response/tournament-series-player.response.dto";
import { LatestTournamentsResponseDto } from "../dtos/response/latest-tournaments.response.dto";

@ApiTags("Tournament Series")
@Controller("tournamentSeries")
export class TournamentSeriesController {
    constructor(
        private readonly service: TournamentSeriesService,
    ) {}

    @Get("findPlayersByTournamentId/:id")
    @ApiTournamentSeriesGetById(
        "Find all players in a specific tournament by tournament ID",
        "id",
        [TournamentSeriesPlayerDto]
    )
    async findPlayersByTournamentId(
        @Param("id", ParseIntPipe) id: number
    ): Promise<TournamentSeriesPlayerDto[]> {
        return await this.service.findPlayersByTournamentId(id);
    }

    @Get("findLatestTournamentsByEventSeriesIds")
    @ApiTournamentSeriesGet(
        "Find the latest tournaments for given event series IDs",
        LatestTournamentsResponseDto
    )
    async findLatestTournaments(
        @Query(new ValidationPipe({ transform: true }))
        query: FindLatestTournamentsQueryDto,
    ): Promise<LatestTournamentsResponseDto> {
        return await this.service.findLatestTournaments(query);
    }

    @Get("findTopXPlayersByTournamentIds")
    @ApiTournamentSeriesGet(
        "Find the top X players across multiple tournaments",
        [TournamentSeriesPlayerDto]
    )
    async findTopXPlayersByTournamentIds(
        @Body(new ValidationPipe({ transform: true }))
        findTopXPlayersDto: FindTopXPlayersDto,
    ): Promise<TournamentSeriesPlayerDto[]> {
        return await this.service.findTopXPlayersByTournamentIds(
            findTopXPlayersDto.x,
            findTopXPlayersDto.tournamentIDs,
        );
    }
}
