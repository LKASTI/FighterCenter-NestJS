

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlayerSeriesPerformanceAgg } from "../entities/PlayerSeriesPerformanceAgg.entity";
import { PlayerSeriesPerformanceAggService } from "./playerSeriesPerformanceAgg.service";
import { PlayerSeriesPerformanceAggRepository } from "./playerSeriesPerformanceAgg.repository";
import { PlayerSeriesPerformanceAggController } from "../../controllers/playerSeriesPerformanceAgg.controller";

@Module({
    imports: [TypeOrmModule.forFeature([PlayerSeriesPerformanceAgg])],
    providers: [PlayerSeriesPerformanceAggService, PlayerSeriesPerformanceAggRepository],
    controllers: [PlayerSeriesPerformanceAggController],
    exports: [PlayerSeriesPerformanceAggService, PlayerSeriesPerformanceAggRepository],
})
export class PlayerSeriesPerformanceAggModule {}
