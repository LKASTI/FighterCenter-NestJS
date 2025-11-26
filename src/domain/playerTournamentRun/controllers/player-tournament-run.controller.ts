import {
    Controller,
    Post,
    Body,
    ValidationPipe,
    Get,
    Query,
    Param,
    ParseIntPipe,
    NotFoundException,
    Patch,
    Delete,
    HttpCode,
} from "@nestjs/common";
import { PlayerTournamentRunService } from "../services/player-tournament-run.service";
import { PlayerTournamentRun } from "@entities/playerTournamentRun.entity";
import {
    CreatePlayerTournamentRunDto,
    FindPlayerTournamentRunsQueryDto,
    UpdatePlayerTournamentRunDto,
} from "../dtos/request";
import {
    ApiPlayerTournamentRunPost,
    ApiPlayerTournamentRunGet,
    ApiPlayerTournamentRunPatch,
    ApiPlayerTournamentRunDelete,
} from "../decorators/player-tournament-run-swagger.decorators";
import { PlayerTournamentRunResponseDto, PlayerTournamentRunsResponseDto } from "../dtos/response/player-tournament-run.response.dto";

@Controller("playerTournamentRun")
export class PlayerTournamentRunController {
    constructor(private readonly service: PlayerTournamentRunService) {}

    @Post()
    @ApiPlayerTournamentRunPost(
        "Create a new player tournament run",
        PlayerTournamentRunResponseDto,
        true
    )
    async create(
        @Body(new ValidationPipe({ transform: true }))
        createPlayerTournamentRunDTO: CreatePlayerTournamentRunDto,
    ): Promise<PlayerTournamentRun> {
        return await this.service.create(createPlayerTournamentRunDTO);
    }

    @Get("findAllByTournamentID")
    @ApiPlayerTournamentRunGet(
        "Get all player tournament runs by tournament ID",
        PlayerTournamentRunsResponseDto
    )
    async findAllByTournamentID(
        @Query("tournamentID", ParseIntPipe) tournamentID: number,
    ) {
        return await this.service.findAllByTournamentID(tournamentID);
    }

    @Get()
    @ApiPlayerTournamentRunGet(
        "Get all player tournament runs",
        PlayerTournamentRunsResponseDto
    )
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindPlayerTournamentRunsQueryDto,
    ) {
        return await this.service.findAll(query);
    }

    @Get("findAllForSeriesTable/:eventID")
    @ApiPlayerTournamentRunGet(
        "Get all player tournament runs for series table",
        undefined,
        true
    )
    async findAllForSeriesTable(
        @Param("eventID", ParseIntPipe) eventID: number,
    ) {
        const tmp = await this.service.findAllForSeriesTable(eventID);
        return tmp;
    }

    @Patch()
    @ApiPlayerTournamentRunPatch(
        "Update a player tournament run",
        PlayerTournamentRunResponseDto,
        true
    )
    async update(
        @Body(new ValidationPipe({ transform: true }))
        updatePlayerTournamentRunDTO: UpdatePlayerTournamentRunDto,
        @Param("playerID", ParseIntPipe) playerID: number,
        @Param("tournamentID", ParseIntPipe) tournamentID: number,
    ): Promise<PlayerTournamentRun> {
        const playerTournamentRun = await this.service.update(
            playerID,
            tournamentID,
            updatePlayerTournamentRunDTO,
        );
        if (!playerTournamentRun) {
            throw new NotFoundException(
                `PlayerTournamentRun with playerID ${playerID} and tournamentID ${tournamentID} not found`,
            );
        }
        return playerTournamentRun;
    }

    @Delete(":playerID/:tournamentID")
    @HttpCode(204)
    @ApiPlayerTournamentRunDelete(
        "Delete a player tournament run",
        true
    )
    async remove(
        @Param("playerID", ParseIntPipe) playerID: number,
        @Param("tournamentID", ParseIntPipe) tournamentID: number,
    ): Promise<void> {
        const result = await this.service.remove(playerID, tournamentID);
        if (!result) {
            throw new NotFoundException(
                `PlayerTournamentRun with playerID ${playerID} and tournamentID ${tournamentID} not found`,
            );
        }
    }
}
