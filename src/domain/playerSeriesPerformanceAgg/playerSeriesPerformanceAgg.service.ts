import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PlayerSeriesPerformanceAgg } from "../entities/PlayerSeriesPerformanceAgg.entity";
import { PlayerSeriesPerformanceAggRepository } from "./playerSeriesPerformanceAgg.repository";


@Injectable()
export class PlayerSeriesPerformanceAggService {
    constructor(
        @InjectRepository(PlayerSeriesPerformanceAgg)
        private readonly playerSeriesPerformanceAggRepository: PlayerSeriesPerformanceAggRepository,
    ) {}

    // TODO: Method to check and update agg data

    // TODO: Get agg data by player and series
    public getPlayerPerformance(playerID: number, eventSeriesID: number) {
        return this.playerSeriesPerformanceAggRepository.findOneBy({
            playerID,
            eventID: eventSeriesID
        });
    }
}