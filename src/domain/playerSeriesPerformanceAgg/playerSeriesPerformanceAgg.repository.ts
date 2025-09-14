import { Repository } from "typeorm";
import { PlayerSeriesPerformanceAgg } from "../entities/PlayerSeriesPerformanceAgg.entity";
import { InjectRepository } from "@nestjs/typeorm";


export class PlayerSeriesPerformanceAggRepository extends Repository<PlayerSeriesPerformanceAgg>{
    constructor(
        @InjectRepository(PlayerSeriesPerformanceAgg)
        private readonly repository: Repository<PlayerSeriesPerformanceAgg>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }


}