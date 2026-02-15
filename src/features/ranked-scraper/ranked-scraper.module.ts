import { Module } from "@nestjs/common";
import { BucklerModule } from "@features/buckler";
import { RankedDataParserModule } from "@features/ranked-parser";
import { RankedScraperService } from "./services/ranked-scraper.service";
import { RankedPageParserService } from "./services/ranked-page-parser.service";
import { RankedScraperController } from "./controllers/ranked-scraper.controller";

@Module({
    imports: [
        BucklerModule,
        RankedDataParserModule,
    ],
    controllers: [RankedScraperController],
    providers: [
        RankedScraperService,
        RankedPageParserService,
    ],
})
export class RankedScraperModule {}
