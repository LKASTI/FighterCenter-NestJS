import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Top8MakerService } from "../features/top8maker/top8maker.service";
import { SeriesAuthGuard } from "../authentication/guards/seriesAuth.guard";


@Controller('top8maker')
export class Top8makerController {
    constructor(
        private readonly top8MakerService: Top8MakerService
    ) {
    }

    @Get('top8data')
    @UseGuards(SeriesAuthGuard)
    async getTop8Data(@Query('slug') slug: string) {
        return this.top8MakerService.getTop8Data(slug);
    }
}