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
import { SFSixRankedProfile } from "@domain/entities/sfsixRankedProfile.entity";
import { SFSixRankedProfileService } from "../services/sfsix-ranked-profile.service";
import { CreateSFSixRankedProfileDto } from "../dtos/request/create-sfsix-ranked-profile.dto";
import { UpdateSFSixRankedProfileDto } from "../dtos/request/update-sfsix-ranked-profile.dto";
import { FindSFSixRankedProfilesQueryDto } from "../dtos/request/find-sfsix-ranked-profiles-query.dto";
import {
    ApiSFSixRankedProfilePost,
    ApiSFSixRankedProfileGet,
    ApiSFSixRankedProfilePatch,
    ApiSFSixRankedProfileDelete,
} from "../decorators/sfsix-ranked-profile-swagger.decorators";

@Controller("sfsixRankedProfile")
export class SFSixRankedProfileController {
    constructor(private readonly service: SFSixRankedProfileService) {}

    @ApiSFSixRankedProfilePost("Create a new SF6 ranked profile", SFSixRankedProfile, true)
    @Post()
    async create(
        @Body() rankedProfileDTO: CreateSFSixRankedProfileDto,
    ): Promise<SFSixRankedProfile> {
        return await this.service.create(rankedProfileDTO);
    }

    @ApiSFSixRankedProfileGet("Get all SF6 ranked profiles with optional filters")
    @Get()
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindSFSixRankedProfilesQueryDto,
    ) {
        return await this.service.findAll(query);
    }

    @ApiSFSixRankedProfileGet("Get an SF6 ranked profile by usercode", SFSixRankedProfile)
    @Get(":id")
    async findByID(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<SFSixRankedProfile> {
        const profile = await this.service.findById(id);
        if (!profile) {
            throw new NotFoundException(
                `SFSixRankedProfile with usercode ${id} not found`,
            );
        }
        return profile;
    }

    @ApiSFSixRankedProfilePatch("Update an SF6 ranked profile", SFSixRankedProfile, true)
    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateSFSixRankedProfileDto: UpdateSFSixRankedProfileDto,
    ): Promise<SFSixRankedProfile> {
        const profile = await this.service.update(
            id,
            updateSFSixRankedProfileDto,
        );
        if (!profile) {
            throw new NotFoundException(
                `SFSixRankedProfile with usercode ${id} not found`,
            );
        }
        return profile;
    }

    @ApiSFSixRankedProfileDelete("Delete an SF6 ranked profile", true)
    @Delete(":id")
    @HttpCode(204) // No Content
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);
        if (!result) {
            throw new NotFoundException(
                `SFSixRankedProfile with usercode ${id} not found`,
            );
        }
    }
}
