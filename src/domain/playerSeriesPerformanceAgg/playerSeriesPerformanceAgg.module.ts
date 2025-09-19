

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlayerSeriesPerformanceAgg } from "../entities/PlayerSeriesPerformanceAgg.entity";
import { PlayerSeriesPerformanceAggService } from "./playerSeriesPerformanceAgg.service";
import { PlayerSeriesPerformanceAggRepository } from "./playerSeriesPerformanceAgg.repository";
import { PlayerSeriesPerformanceAggController } from "../../controllers/playerSeriesPerformanceAgg.controller";
import { EventModule } from "../event/event.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([PlayerSeriesPerformanceAgg]),
        EventModule
    ],
    providers: [PlayerSeriesPerformanceAggService, PlayerSeriesPerformanceAggRepository],
    controllers: [PlayerSeriesPerformanceAggController],
    exports: [PlayerSeriesPerformanceAggService, PlayerSeriesPerformanceAggRepository],
})
export class PlayerSeriesPerformanceAggModule {}
