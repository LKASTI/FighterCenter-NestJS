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
import {
    CreateTournamentSetDTO,
    FindTournamentSetsQueryDTO,
    UpdateTournamentSetDTO,
} from "src/dtos/tournamentSet.dto";
import { TournamentSet } from "src/domain/entities/tournamentSet.entity";
import { TournamentSetService } from "src/domain/tournamentSet/tournamentSet.service";

@Controller("tournamentSet")
export class TournamentSetController {
    constructor(private readonly service: TournamentSetService) {}

    @Post()
    async create(
        @Body() createTournamentSetDTO: CreateTournamentSetDTO,
    ): Promise<TournamentSet> {
        return await this.service.create(createTournamentSetDTO);
    }

    @Get("findAllByTournamentID")
    async findAllByTournamentID(
        @Query("tournamentID", ParseIntPipe) tournamentID: number,
    ) {
        return await this.service.findAllByTournamentID(tournamentID);
    }

    @Get()
    async findAll(@Query() query: FindTournamentSetsQueryDTO) {
        return await this.service.findAll(query);
    }

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

    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateTournamentSetDTO: UpdateTournamentSetDTO,
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
