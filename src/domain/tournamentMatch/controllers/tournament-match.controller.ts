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
} from "@nestjs/common";
import { TournamentMatch } from "@domain/entities/tournamentMatch.entity";
import { TournamentMatchService } from "../services/tournament-match.service";
import { CreateTournamentMatchDto } from "../dtos/request/create-tournament-match.dto";
import { UpdateTournamentMatchDto } from "../dtos/request/update-tournament-match.dto";
import { FindTournamentMatchesQueryDto } from "../dtos/request/find-tournament-matches-query.dto";
import {
    ApiTournamentMatchPost,
    ApiTournamentMatchGet,
    ApiTournamentMatchPatch,
    ApiTournamentMatchDelete,
} from "../decorators/tournament-match-swagger.decorators";

@Controller("tournamentMatch")
export class TournamentMatchController {
    constructor(private readonly service: TournamentMatchService) {}

    @ApiTournamentMatchPost("Create a new tournament match", TournamentMatch, true)
    @Post()
    async create(
        @Body() createTournamentMatch: CreateTournamentMatchDto,
    ): Promise<TournamentMatch> {
        return await this.service.create(createTournamentMatch);
    }

    @ApiTournamentMatchGet("Get all tournament matches with optional filters")
    @Get()
    async findAll(@Query() query: FindTournamentMatchesQueryDto) {
        return await this.service.findAll(query);
    }

    @ApiTournamentMatchGet("Get a tournament match by ID", TournamentMatch)
    @Get(":id")
    async findById(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<TournamentMatch> {
        const tournamentMatch = await this.service.findById(id);

        if (!tournamentMatch)
            throw new NotFoundException(
                `TournamentMatch with ID ${id} not found`,
            );

        return tournamentMatch;
    }

    @ApiTournamentMatchPatch("Update a tournament match", TournamentMatch, true)
    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateTournamentMatchDTO: UpdateTournamentMatchDto,
    ): Promise<TournamentMatch> {
        const tournamentMatch = await this.service.update(
            id,
            updateTournamentMatchDTO,
        );

        if (!tournamentMatch) {
            throw new NotFoundException(
                `TournamentMatch with ID ${id} not found`,
            );
        }

        return tournamentMatch;
    }

    @ApiTournamentMatchDelete("Delete a tournament match", true)
    @Delete(":id")
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);

        if (!result)
            throw new NotFoundException(
                `TournamentMatch with ID ${id} not found`,
            );
    }
}
