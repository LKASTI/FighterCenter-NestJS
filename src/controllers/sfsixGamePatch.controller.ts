import { Controller, Get, Query, ValidationPipe } from "@nestjs/common";
import { FindSFSixGamePatchDTO } from "../dtos/sfsixGamePatch.dto";
import { SFSixGamePatchService } from "../domain/sfsixGamePatch/sfsixGamePatch.service";


@Controller('gamePatch')
export class SFSixGamePatchController {

    constructor(private readonly sfsixGamePatchService: SFSixGamePatchService)
    {}

    @Get()
    async getGamePatches(
        @Query(new ValidationPipe({ transform: true }))
        query: FindSFSixGamePatchDTO,
    ) {
        return await this.sfsixGamePatchService.findAll(query);
    }
}