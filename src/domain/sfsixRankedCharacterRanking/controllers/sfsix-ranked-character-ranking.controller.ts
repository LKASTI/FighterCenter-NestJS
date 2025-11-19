import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    ValidationPipe,
    NotFoundException,
    Param,
    ParseIntPipe,
    Delete,
    HttpCode,
    Patch,
    BadRequestException,
} from "@nestjs/common";
import {
    CreateSfsixRankedCharacterRankingDto,
    FindSfsixRankedCharacterRankingsQueryDto,
    UpdateSfsixRankedCharacterRankingDto,
} from "../dtos/request";
import { SFSixRankedCharacterRanking } from "@entities/sfsixRankedCharacterRanking.entity";
import { SfsixRankedCharacterRankingService } from "../services/sfsix-ranked-character-ranking.service";
import {
    ApiSfsixRankedCharacterRankingPost,
    ApiSfsixRankedCharacterRankingGet,
    ApiSfsixRankedCharacterRankingPatch,
    ApiSfsixRankedCharacterRankingDelete,
} from "../decorators/sfsix-ranked-character-ranking-swagger.decorators";
import { SfsixRankedCharacterRankingResponseDto, SfsixRankedCharacterRankingsResponseDto } from "../dtos/response/sfsix-ranked-character-ranking.response.dto";

@Controller("sfsixRankedCharacterRanking")
export class SfsixRankedCharacterRankingController {
    constructor(
        private readonly service: SfsixRankedCharacterRankingService
    ) {}

    @Post()
    @ApiSfsixRankedCharacterRankingPost(
        "Create a new SF6 ranked character ranking",
        SfsixRankedCharacterRankingResponseDto,
        true
    )
    async create(
        @Body()
        sfsixRankedCharacterRankingDTO: CreateSfsixRankedCharacterRankingDto,
    ): Promise<SFSixRankedCharacterRanking> {
        return await this.service.create(sfsixRankedCharacterRankingDTO);
    }

    @Get()
    @ApiSfsixRankedCharacterRankingGet(
        "Get all SF6 ranked character rankings",
        SfsixRankedCharacterRankingsResponseDto
    )
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindSfsixRankedCharacterRankingsQueryDto,
    ) {
        return await this.service.findAll(query);
    }

    @Get("findAllRankedPlayerAndCharacterInfoByDateAndPhase")
    @ApiSfsixRankedCharacterRankingGet(
        "Get all ranked player and character info by date and phase",
        SfsixRankedCharacterRankingsResponseDto
    )
    async findAllRankedPlayerAndCharacterInfoByDateAndPhase(
        @Query(new ValidationPipe({ transform: true }))
        query: FindSfsixRankedCharacterRankingsQueryDto,
    ) {
        if (!query.phase)
            throw new BadRequestException(
                `Request must contain a phase and date`,
            );
        if (!query.date)
            throw new BadRequestException(
                `Request must contain a phase and date`,
            );
        return await this.service.findAllRankedPlayerAndCharacterInfoByDateAndPhase(
            query,
        );
    }

    @Get("findAllPhases")
    @ApiSfsixRankedCharacterRankingGet(
        "Get all distinct phases",
    )
    async findAllPhases() {
        return await this.service.findAllPhases();
    }

    @Get("findAllWeeklyDatesByPhase/:phase")
    @ApiSfsixRankedCharacterRankingGet(
        "Get all weekly dates by phase",
    )
    async findAllWeeklyDatesByPhase(
        @Param("phase", ParseIntPipe) phase: number,
    ) {
        const dates = await this.service.findAllWeeklyDatesByPhase(phase);
        return dates;
    }

    @Get("findAllDistinctDatePhaseSeason")
    @ApiSfsixRankedCharacterRankingGet(
        "Get all distinct date, phase, and season combinations",
    )
    async findAllDistinctDatePhaseSeason() {
        const res = await this.service.findAllDistinctDatePhaseSeason();

        if (!res)
            throw new NotFoundException(
                "No SFSixRankedCharacterRanking records were found with dates, phases, or seasons",
            );

        return res;
    }

    @Get(":id")
    @ApiSfsixRankedCharacterRankingGet(
        "Get SF6 ranked character ranking by ID",
        SfsixRankedCharacterRankingResponseDto
    )
    async findByID(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<SFSixRankedCharacterRanking> {
        const rankedCharacter = await this.service.findById(id);
        if (!rankedCharacter) {
            throw new NotFoundException(
                `SFSixRankedCharacterRanking with ID ${id} not found`,
            );
        }
        return rankedCharacter;
    }

    @Patch(":id")
    @ApiSfsixRankedCharacterRankingPatch(
        "Update SF6 ranked character ranking",
        SfsixRankedCharacterRankingResponseDto,
        true
    )
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body()
        updateSFSixRankedCharacterRankingDto: UpdateSfsixRankedCharacterRankingDto,
    ): Promise<SFSixRankedCharacterRanking> {
        const rankedCharacter = await this.service.update(
            id,
            updateSFSixRankedCharacterRankingDto,
        );
        if (!rankedCharacter) {
            throw new NotFoundException(
                `SFSixRankedCharacterRanking with ID ${id} not found`,
            );
        }
        return rankedCharacter;
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiSfsixRankedCharacterRankingDelete(
        "Delete SF6 ranked character ranking",
        true
    )
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);
        if (!result)
            throw new NotFoundException(
                `SFSixRankedCharacterRanking with ID ${id} not found`,
            );
    }
}
