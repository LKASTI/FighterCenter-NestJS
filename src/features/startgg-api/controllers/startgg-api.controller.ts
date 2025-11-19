import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { StartggApiService } from "../services/startgg-api.service";
import {
    ApiStartggGetWithQuery,
    ApiStartggGetWithParam
} from "../decorators/startgg-api-swagger.decorators";
import { Event } from "../graphql/startgg-api.graphql";

@ApiTags("Start.gg API")
@Controller('startggApi')
export class StartggApiController{
    constructor(
        private readonly startggApiService: StartggApiService
    ) {}

    @Get('event')
    @ApiStartggGetWithQuery(
        "Get event data from Start.gg by slug",
        "slug",
        "The slug identifier for the event (e.g., 'tournament-slug/event/event-slug')",
        Event,
        true // This endpoint is disabled
    )
    async getEvent(@Query('slug') slug: string): Promise<Event | null> {
        return this.startggApiService.getEvent(slug);
    }

    @Get('top8PlayerData/:eventId')
    @ApiStartggGetWithParam(
        "Get top 8 player data for an event",
        "eventId",
        "The numeric ID of the event",
        Event,
        true // This endpoint is disabled
    )
    async getTop8PlayerData(@Param('eventId') eventId: string): Promise<Event | null> {
        return this.startggApiService.getTop8PlayerData(eventId);
    }
}
