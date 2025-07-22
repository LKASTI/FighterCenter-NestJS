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
    Patch, UseGuards,
} from "@nestjs/common";
import {
    CreateSFSixRankedCharacterDTO,
    FindSFSixRankedCharactersQueryDTO,
    UpdateSFSixRankedCharacterDTO,
} from "src/dtos/sfsixRankedCharacter.dto";
import { SFSixRankedCharacter } from "src/domain/entities/sfsixRankedCharacter.entity";
import { SFSixRankedCharacterService } from "src/domain/sfsixRankedCharacter/sfsixRankedCharacter.service";
import { FeatureFlagGuard } from "../authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "../decorators/endpoint-status-toggles";

@Controller("sfsixRankedCharacter")
@UseGuards(FeatureFlagGuard)
export class SFSixRankedCharacterController {
    constructor(private readonly service: SFSixRankedCharacterService) {}

    @DisableEndpoint()
    @Post()
    async create(
        @Body() sfsixRankedCharacterDTO: CreateSFSixRankedCharacterDTO,
    ): Promise<SFSixRankedCharacter> {
        return await this.service.create(sfsixRankedCharacterDTO);
    }

    @Get()
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindSFSixRankedCharactersQueryDTO,
    ) {
        return await this.service.findAll(query);
    }

    @Get(":id")
    async findByID(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<SFSixRankedCharacter> {
        const rankedCharacter = await this.service.findById(id);
        if (!rankedCharacter) {
            throw new NotFoundException(
                `SFSixRankedCharacter with ID ${id} not found`,
            );
        }
        return rankedCharacter;
    }

    @DisableEndpoint()
    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateSFSixRankedCharacterDto: UpdateSFSixRankedCharacterDTO,
    ): Promise<SFSixRankedCharacter> {
        const rankedCharacter = await this.service.update(
            id,
            updateSFSixRankedCharacterDto,
        );
        if (!rankedCharacter) {
            throw new NotFoundException(
                `SFSixRankedCharacter with ID ${id} not found`,
            );
        }
        return rankedCharacter;
    }

    @DisableEndpoint()
    @Delete(":id")
    @HttpCode(204) // No Content
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);
        if (!result)
            throw new NotFoundException(
                `SFSixRankedCharacter with ID ${id} not found`,
            );
    }
}
