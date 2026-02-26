import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import {
    BucklerConfigService,
    BucklerHttpService,
    BucklerNotificationService,
    SF6BucklerConfig,
    CookieExpiredError,
    HTMLParsingError,
} from "@features/buckler";
import { RankedDataParserService, RankedPlayerRecord } from "@features/ranked-parser";
import { RankedPageParserService } from "./ranked-page-parser.service";

const TOTAL_PAGES = 100;
const RANKING_PATH = "/ranking/master";
const PHASE_REMINDER_DAYS = 80;

@Injectable()
export class RankedScraperService {
    private readonly logger = new Logger(RankedScraperService.name);

    constructor(
        private readonly appConfigService: ConfigService,
        private readonly configService: BucklerConfigService,
        private readonly httpService: BucklerHttpService,
        private readonly notificationService: BucklerNotificationService,
        private readonly pageParser: RankedPageParserService,
        private readonly rankedDataParser: RankedDataParserService,
    ) {}

    /**
     * Daily ranked data scraper cron job.
     * Runs at 11:00 PM UTC.
     *
     * Buffer-then-save strategy:
     * 1. Scrape all 100 pages into memory (no DB writes)
     * 2. Only after all pages succeed, import to DB via RankedDataParserService
     * 3. If cookies expire mid-scrape, abort and discard buffer (DB untouched)
     */
    /**
     * Daily ranked data scraper cron job.
     * Runs at 11:00 PM UTC. Temporarily disabled in production —
     * use POST /ranked-scraper/trigger-scrape for manual runs.
     */
    @Cron("0 23 * * *")
    async handleCron(): Promise<void> {
        const env = this.appConfigService.get<string>("NODE_ENV");
        if (env === "production") {
            this.logger.log("Ranked scraper cron skipped in production — use manual trigger");
            return;
        }

        await this.scrapeRankedData();
    }

    /**
     * Core scrape logic. Called by the cron job and the manual trigger endpoint.
     *
     * Buffer-then-save strategy:
     * 1. Scrape all 100 pages into memory (no DB writes)
     * 2. Only after all pages succeed, import to DB via RankedDataParserService
     * 3. If cookies expire mid-scrape, abort and discard buffer (DB untouched)
     */
    async scrapeRankedData(): Promise<void> {
        const startTime = Date.now();

        // Load config once for the entire scrape cycle
        const config = await this.configService.getConfig();

        if (!config.enabled) {
            this.logger.log("Ranked scraper is disabled - skipping");
            return;
        }

        this.logger.log("Starting daily ranked data scrape...");

        let currentPage = 0;

        try {
            // Build cookies from config
            if (!config.bucklerId || !config.bucklerRId) {
                await this.notificationService.notifyFailure(
                    "Ranked Scraper Failed",
                    "Buckler cookies are not configured. Update cookies via PATCH /buckler-config.",
                );
                this.logger.warn("⚠️  Buckler cookies not configured - skipping scrape");
                return;
            }

            const cookies: Record<string, string> = {
                buckler_id: config.bucklerId,
                buckler_r_id: config.bucklerRId,
            };
            if (config.bucklerPraiseDate) {
                cookies.buckler_praise_date = config.bucklerPraiseDate;
            }

            // Validate phase and season
            if (!config.phase || !config.season) {
                await this.notificationService.notifyFailure(
                    "Ranked Scraper Failed",
                    "Phase and/or season not configured. Update via PATCH /buckler-config.",
                );
                this.logger.warn("⚠️  Phase/season not configured - skipping scrape");
                return;
            }

            // Buffer phase: scrape all pages into memory
            const allRecords: RankedPlayerRecord[] = [];

            for (let page = 1; page <= TOTAL_PAGES; page++) {
                currentPage = page;

                const html = await this.httpService.fetchPage(
                    RANKING_PATH,
                    cookies,
                    { page: String(page), season_type: "1" },
                );

                const records = this.pageParser.parsePage(html, page);
                allRecords.push(...records);

                if (page % 10 === 0) {
                    this.logger.log(`Scrape progress: ${page}/${TOTAL_PAGES} pages (${allRecords.length} records)`);
                }
            }

            // Validation
            if (allRecords.length === 0) {
                await this.notificationService.notifyFailure(
                    "Ranked Scraper Failed",
                    "Scraped 0 records across all pages. Something may be wrong with the page structure.",
                );
                this.logger.error("❌ Scraped 0 records - aborting import");
                return;
            }

            // Import phase: save to DB via existing parser
            this.logger.log(`Scrape complete: ${allRecords.length} records. Starting DB import...`);
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            await this.rankedDataParser.processBatchRecords(allRecords, today, config.phase, config.season);

            const duration = Date.now() - startTime;
            this.logger.log(
                `✅ Ranked scrape completed: ${allRecords.length} records imported in ${(duration / 1000).toFixed(1)}s`,
            );

            // await this.notificationService.notifySuccess(
            //     "Ranked Scraper Completed",
            //     `${allRecords.length} records imported in ${(duration / 1000).toFixed(1)}s.`,
            // );

            // Check for phase reminder
            await this.checkPhaseReminder(config);
        } catch (error) {
            const duration = Date.now() - startTime;
            const pageInfo = currentPage > 0 ? ` on page ${currentPage}/${TOTAL_PAGES}` : "";

            if (error instanceof CookieExpiredError) {
                this.logger.error(`❌ Cookie expiry detected${pageInfo} after ${(duration / 1000).toFixed(1)}s: ${error.message}`);
                await this.notificationService.notifyFailure(
                    "Ranked Scraper Failed",
                    `Cookie expiry detected${pageInfo}. Update cookies via PATCH /buckler-config.`,
                );
                return;
            }

            if (error instanceof HTMLParsingError) {
                this.logger.error(`❌ HTML parsing failed${pageInfo} after ${(duration / 1000).toFixed(1)}s: ${error.message}`);
                await this.notificationService.notifyFailure(
                    "Ranked Scraper Failed",
                    `HTML parsing failed${pageInfo} - expected elements not found. Buckler may have updated their page structure.`,
                );
                return;
            }

            this.logger.error(`❌ Ranked scrape failed${pageInfo} after ${(duration / 1000).toFixed(1)}s`, error.stack || error);
            await this.notificationService.notifyFailure(
                "Ranked Scraper Failed",
                `Unexpected error${pageInfo}: ${error.message}`,
            );
        }
    }

    /**
     * Check if a phase transition reminder should be sent.
     * Sends a warning if the current phase started 80+ days ago.
     */
    private async checkPhaseReminder(config: SF6BucklerConfig): Promise<void> {
        try {
            if (!config.phaseStartDate) return;

            const daysSinceStart = Math.floor(
                (Date.now() - new Date(config.phaseStartDate).getTime()) / (1000 * 60 * 60 * 24),
            );

            if (daysSinceStart >= PHASE_REMINDER_DAYS) {
                await this.notificationService.notifyWarning(
                    "Phase Transition Reminder",
                    `Phase ${config.phase} started ${daysSinceStart} days ago. A new phase may be approaching.\nUpdate phase/season via PATCH /buckler-config when Capcom announces it.`,
                );
            }
        } catch (error) {
            this.logger.warn(`Failed to check phase reminder: ${error.message}`);
        }
    }
}
