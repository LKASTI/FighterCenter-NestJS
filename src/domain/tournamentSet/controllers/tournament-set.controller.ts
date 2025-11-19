import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    Param,
    ParseIntPipe,
    NotFoundException,
    Patch,
    Delete,
    HttpCode,
} from "@nestjs/common";
import { TournamentSet } from "@domain/entities/tournamentSet.entity";
import { TournamentSetService } from "../services/tournament-set.service";
import { CreateTournamentSetDto } from "../dtos/request/create-tournament-set.dto";
import { UpdateTournamentSetDto } from "../dtos/request/update-tournament-set.dto";
import { FindTournamentSetsQueryDto } from "../dtos/request/find-tournament-sets-query.dto";
import {
    ApiTournamentSetPost,
    ApiTournamentSetGet,
    ApiTournamentSetPatch,
    ApiTournamentSetDelete,
} from "../decorators/tournament-set-swagger.decorators";

@Controller("tournamentSet")
export class TournamentSetController {
    constructor(private readonly service: TournamentSetService) {}

    @ApiTournamentSetPost("Create a new tournament set", TournamentSet, true)
    @Post()
    async create(
        @Body() createTournamentSetDTO: CreateTournamentSetDto,
    ): Promise<TournamentSet> {
        return await this.service.create(createTournamentSetDTO);
    }

    @ApiTournamentSetGet("Get all sets for a specific tournament")
    @Get("findAllByTournamentID")
    async findAllByTournamentID(
        @Query("tournamentID", ParseIntPipe) tournamentID: number,
    ) {
        return await this.service.findAllByTournamentID(tournamentID);
    }

    @ApiTournamentSetGet("Get all tournament sets with optional filters")
    @Get()
    async findAll(@Query() query: FindTournamentSetsQueryDto) {
        return await this.service.findAll(query);
    }

    @ApiTournamentSetGet("Get a tournament set by ID", TournamentSet)
    @Get(":id")
    async findByID(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<TournamentSet> {
        const tournamentSet = await this.service.findById(id);

        if (!tournamentSet) {
            throw new NotFoundException(
                `TournamentSet with ID ${id} not found`,
            );
        }

        return tournamentSet;
    }

    @ApiTournamentSetPatch("Update a tournament set", TournamentSet, true)
    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateTournamentSetDTO: UpdateTournamentSetDto,
    ): Promise<TournamentSet> {
        const tournamentSet = await this.service.update(
            id,
            updateTournamentSetDTO,
        );

        if (!tournamentSet) {
            throw new NotFoundException(
                `TournamentSet with ID ${id} not found`,
            );
        }

        return tournamentSet;
    }

    @ApiTournamentSetDelete("Delete a tournament set", true)
    @Delete(":id")
    @HttpCode(204) // No Content
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);

        if (!result) {
            throw new NotFoundException(
                `TournamentSet with ID ${id} not found`,
            );
        }
    }
}
