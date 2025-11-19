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
} from "@nestjs/common";
import { SFSixRankedCharacter } from "@domain/entities/sfsixRankedCharacter.entity";
import { SFSixRankedCharacterService } from "../services/sfsix-ranked-character.service";
import { CreateSFSixRankedCharacterDto } from "../dtos/request/create-sfsix-ranked-character.dto";
import { UpdateSFSixRankedCharacterDto } from "../dtos/request/update-sfsix-ranked-character.dto";
import { FindSFSixRankedCharactersQueryDto } from "../dtos/request/find-sfsix-ranked-characters-query.dto";
import {
    ApiSFSixRankedCharacterPost,
    ApiSFSixRankedCharacterGet,
    ApiSFSixRankedCharacterPatch,
    ApiSFSixRankedCharacterDelete,
} from "../decorators/sfsix-ranked-character-swagger.decorators";

@Controller("sfsixRankedCharacter")
export class SFSixRankedCharacterController {
    constructor(private readonly service: SFSixRankedCharacterService) {}

    @ApiSFSixRankedCharacterPost("Create a new SF6 ranked character", SFSixRankedCharacter, true)
    @Post()
    async create(
        @Body() sfsixRankedCharacterDTO: CreateSFSixRankedCharacterDto,
    ): Promise<SFSixRankedCharacter> {
        return await this.service.create(sfsixRankedCharacterDTO);
    }

    @ApiSFSixRankedCharacterGet("Get all SF6 ranked characters with optional filters")
    @Get()
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindSFSixRankedCharactersQueryDto,
    ) {
        return await this.service.findAll(query);
    }

    @ApiSFSixRankedCharacterGet("Get an SF6 ranked character by ID", SFSixRankedCharacter)
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

    @ApiSFSixRankedCharacterPatch("Update an SF6 ranked character", SFSixRankedCharacter, true)
    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateSFSixRankedCharacterDto: UpdateSFSixRankedCharacterDto,
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

    @ApiSFSixRankedCharacterDelete("Delete an SF6 ranked character", true)
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
