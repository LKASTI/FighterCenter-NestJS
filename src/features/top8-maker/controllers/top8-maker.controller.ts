import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Top8MakerService } from "../services/top8-maker.service";
import { ApiTop8MakerGet } from "../decorators/top8-maker-swagger.decorators";
import { Top8MakerDataResponse } from "../dtos/response/top8-maker-data.response.dto";

@ApiTags("Top 8 Maker")
@Controller('top8maker')
export class Top8MakerController {
    constructor(
        private readonly top8MakerService: Top8MakerService
    ) {}

    @Get('top8data')
    @ApiTop8MakerGet(
        "Get top 8 player data for tournament bracket generation",
        Top8MakerDataResponse
    )
    async getTop8Data(@Query('slug') slug: string): Promise<Top8MakerDataResponse> {
        return this.top8MakerService.getTop8Data(slug);
    }
}
