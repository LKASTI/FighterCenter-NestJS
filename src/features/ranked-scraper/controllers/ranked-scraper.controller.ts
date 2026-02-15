import { BadGatewayException, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Roles } from "@decorators/roles.decorator";
import { BucklerConfigService, BucklerHttpService, BucklerNotificationService, CookieExpiredError, HTMLParsingError } from "@features/buckler";
import { RankedPageParserService } from "../services/ranked-page-parser.service";
import { TestScrapeResponseDTO } from "../dtos/test-scrape.response.dto";
import { ApiRankedScraperPost } from "../decorators/ranked-scraper-swagger.decorators";

const RANKING_PATH = "/ranking/master";

@ApiTags("Ranked Scraper")
@Controller("ranked-scraper")
export class RankedScraperController {
    constructor(
        private readonly configService: BucklerConfigService,
        private readonly httpService: BucklerHttpService,
        private readonly notificationService: BucklerNotificationService,
        private readonly pageParser: RankedPageParserService,
    ) {}

    /**
     * Dry-run test: fetch page 1 from Buckler, parse it, and return the records.
     * No database writes. Used to verify cookies are valid and HTML parsing works.
     */
    @Post("test-scrape")
    @Roles("SUPER_ADMIN")
    @ApiRankedScraperPost("Test scrape page 1 (dry run, no DB writes)", TestScrapeResponseDTO)
    async testScrape(): Promise<TestScrapeResponseDTO> {
        const config = await this.configService.getConfig();

        if (!config.bucklerId || !config.bucklerRId) {
            throw new BadGatewayException(
                "Buckler cookies are not configured. Update cookies via PATCH /buckler-config.",
            );
        }

        const cookies: Record<string, string> = {
            buckler_id: config.bucklerId,
            buckler_r_id: config.bucklerRId,
        };
        if (config.bucklerPraiseDate) {
            cookies.buckler_praise_date = config.bucklerPraiseDate;
        }

        try {
            const html = await this.httpService.fetchPage(
                RANKING_PATH,
                cookies,
                { page: "1", season_type: "1" },
            );

            const records = this.pageParser.parsePage(html, 1);

            await this.notificationService.notifySuccess(
                "Test Scrape Passed",
                `Fetched and parsed page 1: ${records.length} records. Cookies and HTML parsing are working.`,
            );

            return {
                recordCount: records.length,
                page: 1,
                records,
            };
        } catch (error) {
            if (error instanceof CookieExpiredError) {
                throw new BadGatewayException(
                    `Cookie expiry detected: ${error.message}. Update cookies via PATCH /buckler-config.`,
                );
            }
            if (error instanceof HTMLParsingError) {
                throw new BadGatewayException(
                    `HTML parsing failed: ${error.message}. Buckler may have updated their page structure.`,
                );
            }
            throw error;
        }
    }
}
