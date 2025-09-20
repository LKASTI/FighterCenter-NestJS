import { Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from "@nestjs/common";
import {
    PlayerSeriesPerformanceAggService
} from "../domain/playerSeriesPerformanceAgg/playerSeriesPerformanceAgg.service";
import { FeatureFlagGuard } from "../authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "../decorators/endpoint-status-toggles";


@Controller('playerSeriesPerformanceAgg')
@UseGuards(FeatureFlagGuard)
export class PlayerSeriesPerformanceAggController {
    constructor(
        private readonly playerSeriesPerformanceAggService: PlayerSeriesPerformanceAggService
    ) {}

    @Get('getAllForSeries/:eventID')
    async getAllForSeries(
        @Param("eventID", ParseIntPipe) eventID: number
    ) {
        return await this.playerSeriesPerformanceAggService.getAllForSeries(eventID);
    }

    @Get('getAllForSeriesTable/:eventID')
    async getAllForSeriesTable(
        @Param("eventID", ParseIntPipe) eventID: number
    ) {
        return await this.playerSeriesPerformanceAggService.getAllForSeriesTable(eventID);
    }

    @Get('performanceData/:eventID/:playerID')
    async getPlayerPerformanceData(
        @Param("eventID", ParseIntPipe) eventID: number,
        @Param("playerID", ParseIntPipe) playerID: number
    ) {
        return await this.playerSeriesPerformanceAggService.getPlayerPerformanceData(playerID, eventID);
    }

    @DisableEndpoint()
    @Patch('updateAll/:eventID')
    async updateAllForSeries(
        @Param("eventID", ParseIntPipe) eventID: number
    ) {
        return await this.playerSeriesPerformanceAggService.updateAllForSeries(eventID);
    }

    @DisableEndpoint()
    @Patch('update/:eventID/:playerID')
    async updatePlayerPerformanceData(
        @Param("eventID", ParseIntPipe) eventID: number,
        @Param("playerID", ParseIntPipe) playerID: number
    ) {
        const updated = await this.playerSeriesPerformanceAggService.updatePlayerPerformanceData(playerID, eventID);
        return { updated };
    }
}