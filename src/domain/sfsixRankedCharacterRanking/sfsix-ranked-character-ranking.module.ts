import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SfsixRankedCharacterRankingController } from "./controllers/sfsix-ranked-character-ranking.controller";
import { SFSixRankedCharacterRanking } from "@entities/sfsixRankedCharacterRanking.entity";
import { SfsixRankedCharacterRankingRepository } from "./repositories/sfsix-ranked-character-ranking.repository";
import { SfsixRankedCharacterRankingService } from "./services/sfsix-ranked-character-ranking.service";
import { CommonModule } from "@common/common.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([SFSixRankedCharacterRanking]),
        CommonModule
    ],
    providers: [
        SfsixRankedCharacterRankingService,
        SfsixRankedCharacterRankingRepository,
        Logger,
    ],
    controllers: [SfsixRankedCharacterRankingController],
    exports: [SfsixRankedCharacterRankingService],
})
export class SfsixRankedCharacterRankingModule {}
