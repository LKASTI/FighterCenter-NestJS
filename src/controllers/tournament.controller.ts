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
import {
    CreateTournamentDTO,
    FindTournamentsQueryDTO,
    UpdateTournamentDTO,
} from "src/dtos/tournament.dto";
import { Tournament } from "src/domain/entities/tournament.entity";
import { TournamentService } from "src/domain/tournament/tournament.service";

@Controller("tournament")
export class TournamentController {
    constructor(private readonly service: TournamentService) {}

    @Post()
    async create(
        @Body(new ValidationPipe({ transform: true }))
        tournamentDTO: CreateTournamentDTO,
    ): Promise<Tournament> {
        return await this.service.create(tournamentDTO);
    }

    @Get()
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindTournamentsQueryDTO,
    ) {
        return await this.service.findAll(query);
    }

    @Get(":id")
    async findByID(@Param("id", ParseIntPipe) id: number): Promise<Tournament> {
        const tournament = await this.service.findById(id);
        if (!tournament) {
            throw new NotFoundException(`Tournament with ID ${id} not found`);
        }
        return tournament;
    }

    @Get("findAllGamePatchesByEventId/:eventID")
    async findAllGamePatchesByEventId(
        @Param("eventID", ParseIntPipe) eventID: number,
    ) {
        return await this.service.findAllGamePatchesByEventId(eventID);
    }

    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body(new ValidationPipe({ transform: true }))
        updateTournamentDto: UpdateTournamentDTO,
    ): Promise<Tournament> {
        const tournament = await this.service.update(id, updateTournamentDto);
        if (!tournament) {
            throw new NotFoundException(`Tournament with ID ${id} not found`);
        }
        return tournament;
    }

    @Delete(":id")
    @HttpCode(204) // No Content
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);
        if (!result)
            throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
}
