import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RankedDataParserController } from "src/controllers/rankedDataParser.controller";
import { SFSixRankedCharacterModule } from "src/domain/sfsixRankedCharacter/sfsixRankedCharacter.module";
import { SFSixRankedCharacterRankingModule } from "src/domain/sfsixRankedCharacterRanking/sfsixRankedCharacterRanking.module";
import { SFSixRankedProfileModule } from "src/domain/sfsixRankedProfile/sfsixRankedProfile.module";
import { RankedDataParserService } from "src/features/rankedParser/rankedDataParser.service";

@Module({
    imports: [
        SFSixRankedCharacterModule,
        SFSixRankedProfileModule,
        SFSixRankedCharacterRankingModule,
    ],
    providers: [RankedDataParserService],
    controllers: [RankedDataParserController],
    exports: [RankedDataParserService],
})
export class RankedDataParserModule {}
