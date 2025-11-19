import { Module } from "@nestjs/common";
import { RankedDataParserController } from "./controllers/ranked-data-parser.controller";
import { SFSixRankedCharacterModule } from "@domain/sfsixRankedCharacter/sfsixRankedCharacter.module";
import { SFSixRankedCharacterRankingModule } from "@domain/sfsixRankedCharacterRanking/sfsixRankedCharacterRanking.module";
import { SFSixRankedProfileModule } from "@domain/sfsixRankedProfile/sfsixRankedProfile.module";
import { RankedDataParserService } from "./services/ranked-data-parser.service";
import { CommonModule } from "@common/common.module";

@Module({
    imports: [
        SFSixRankedCharacterModule,
        SFSixRankedProfileModule,
        SFSixRankedCharacterRankingModule,
        CommonModule
    ],
    providers: [RankedDataParserService],
    controllers: [RankedDataParserController],
    exports: [RankedDataParserService],
})
export class RankedDataParserModule {}
