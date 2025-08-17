import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { StartggApiService } from "../features/startggApi/startggApi.service";
import { FeatureFlagGuard } from "../authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "../decorators/endpoint-status-toggles";

@Controller('startggApi')
@UseGuards(FeatureFlagGuard)
export class StartggApiController{
    constructor(
        private readonly startggApiService: StartggApiService
    ) {}

    @Get('event')
    @DisableEndpoint()
    async getEvent(@Query('slug') slug: string) {
        return this.startggApiService.getEvent(slug);
    }

    @DisableEndpoint()
    @Get('top8PlayerData/:eventId')
    async getTop8PlayerData(@Param('eventId') eventId: string) {
        return this.startggApiService.getTop8PlayerData(eventId);
    }
}