import { Controller, Get, Query, ValidationPipe } from "@nestjs/common";
import { SFSixGamePatchService } from "../services/sfsix-game-patch.service";
import { FindSFSixGamePatchQueryDto } from "../dtos/request/find-sfsix-game-patch-query.dto";
import { ApiSFSixGamePatchGet } from "../decorators/sfsix-game-patch-swagger.decorators";

@Controller('gamePatch')
export class SFSixGamePatchController {
    constructor(private readonly sfsixGamePatchService: SFSixGamePatchService) {}

    @Get()
    @ApiSFSixGamePatchGet("Get all game patches with optional filters")
    async getGamePatches(
        @Query(new ValidationPipe({ transform: true }))
        query: FindSFSixGamePatchQueryDto,
    ) {
        return await this.sfsixGamePatchService.findAll(query);
    }
}
