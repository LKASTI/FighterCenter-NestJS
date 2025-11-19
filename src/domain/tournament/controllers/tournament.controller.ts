import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    ValidationPipe,
} from "@nestjs/common";
import { Tournament } from "@domain/entities/tournament.entity";
import { TournamentService } from "../services/tournament.service";
import { CreateTournamentDto } from "../dtos/request/create-tournament.dto";
import { UpdateTournamentDto } from "../dtos/request/update-tournament.dto";
import { FindTournamentsQueryDto } from "../dtos/request/find-tournaments-query.dto";
import {
    ApiTournamentPost,
    ApiTournamentGet,
    ApiTournamentPatch,
    ApiTournamentDelete
} from "../decorators/tournament-swagger.decorators";

@Controller("tournament")
export class TournamentController {
    constructor(private readonly service: TournamentService) {}

    @Post()
    @ApiTournamentPost("Create a new tournament", Tournament, true)
    async create(
        @Body(new ValidationPipe({ transform: true }))
        tournamentDto: CreateTournamentDto,
    ): Promise<Tournament> {
        return await this.service.create(tournamentDto);
    }

    @Get()
    @ApiTournamentGet("Get all tournaments with optional filters")
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindTournamentsQueryDto,
    ) {
        return await this.service.findAll(query);
    }

    @Get(":id")
    @ApiTournamentGet("Get a tournament by ID", Tournament)
    async findByID(@Param("id", ParseIntPipe) id: number): Promise<Tournament> {
        const tournament = await this.service.findById(id);
        if (!tournament) {
            throw new NotFoundException(`Tournament with ID ${id} not found`);
        }
        return tournament;
    }

    @Get("findAllGamePatchesByEventId/:eventID")
    @ApiTournamentGet("Get all game patches for an event")
    async findAllGamePatchesByEventId(
        @Param("eventID", ParseIntPipe) eventID: number,
    ) {
        return await this.service.findAllGamePatchesByEventId(eventID);
    }

    @Patch(":id")
    @ApiTournamentPatch("Update a tournament by ID", Tournament, true)
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body(new ValidationPipe({ transform: true }))
        updateTournamentDto: UpdateTournamentDto,
    ): Promise<Tournament> {
        const tournament = await this.service.update(id, updateTournamentDto);
        if (!tournament) {
            throw new NotFoundException(`Tournament with ID ${id} not found`);
        }
        return tournament;
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiTournamentDelete("Delete a tournament by ID", true)
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);
        if (!result)
            throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
}
