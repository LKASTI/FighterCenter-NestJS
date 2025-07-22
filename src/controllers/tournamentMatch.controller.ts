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
    UseGuards,
} from "@nestjs/common";
import {
    CreateTournamentMatchDTO,
    FindTournamentMatchesQueryDTO,
    UpdateTournamentMatchDTO,
} from "src/dtos/tournamentMatch.dto";
import { TournamentMatchService } from "src/domain/tournamentMatch/tournamentMatch.service";
import { TournamentMatch } from "src/domain/entities/tournamentMatch.entity";
import { DisableEndpoint } from "../decorators/endpoint-status-toggles";
import { FeatureFlagGuard } from "../authentication/guards/feature-flag.guard";

@Controller("tournamentMatch")
@UseGuards(FeatureFlagGuard)
export class TournamentMatchController {
    constructor(private readonly service: TournamentMatchService) {}

    @DisableEndpoint()
    @Post()
    async create(
        @Body() createTournamentMatch: CreateTournamentMatchDTO,
    ): Promise<TournamentMatch> {
        return await this.service.create(createTournamentMatch);
    }

    @Get()
    async findAll(@Query() query: FindTournamentMatchesQueryDTO) {
        return await this.service.findAll(query);
    }

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

    @DisableEndpoint()
    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateTournamentMatchDTO: UpdateTournamentMatchDTO,
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

    @DisableEndpoint()
    @Delete(":id")
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);

        if (!result)
            throw new NotFoundException(
                `TournamentMatch with ID ${id} not found`,
            );
    }
}
