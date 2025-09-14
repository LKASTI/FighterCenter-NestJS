import { Controller } from "@nestjs/common";
import {
    PlayerSeriesPerformanceAggService
} from "../domain/playerSeriesPerformanceAgg/playerSeriesPerformanceAgg.service";


@Controller('playerSeriesPerformanceAgg')
export class PlayerSeriesPerformanceAggController {
    constructor(
        private readonly playerSeriesPerformanceAggService: PlayerSeriesPerformanceAggService
    ) {}
}