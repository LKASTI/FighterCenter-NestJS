import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";
import { RankedPlayerRecord } from "@features/ranked-parser";
import { HTMLParsingError } from "@features/buckler";

/** CSS selectors matching the Buckler ranking page structure */
const SELECTORS = {
    /** Player list container (appears twice: logged-in user card + main ranking list) */
    PLAYER_LIST: "ul.ranking_ranking_list__szajj",
    /** Player name span */
    PLAYER_NAME: "span.ranking_name__El29_",
    /** Character portrait container (img alt = character name) */
    CHARACTER: "div.ranking_character__WoGAX",
    /** Country flag wrapper (img alt = country name) */
    COUNTRY_FLAG: "span.ranking_frag__D7XnG",
    /** Rank and MR container (contains dt = rank, dd = MR) */
    RANK_MR: "div.ranking_time__teMP4",
    /** League rank icon section (noscript contains icon filename) */
    LEAGUE_ICON: "div.ranking_league_rank_icon__0bF5k",
};

@Injectable()
export class RankedPageParserService {
    private readonly logger = new Logger(RankedPageParserService.name);

    /**
     * Parse one page of Buckler ranking HTML into structured records.
     *
     * Uses structure-based parsing: each player is a self-contained <li>
     * element, so all data is extracted relative to that <li> rather than
     * relying on fragile offset-based indexing.
     *
     * @param html - Raw HTML string from a Buckler ranking page
     * @param pageNumber - Page number (for error context)
     * @returns Array of ranked player records parsed from the page
     * @throws HTMLParsingError if expected elements are not found
     */
    parsePage(html: string, pageNumber?: number): RankedPlayerRecord[] {
        const $ = cheerio.load(html);
        const playerLists = $(SELECTORS.PLAYER_LIST);

        if (playerLists.length < 2) {
            throw new HTMLParsingError(
                pageNumber,
                `Expected at least 2 '${SELECTORS.PLAYER_LIST}' elements, found ${playerLists.length}${pageNumber ? ` on page ${pageNumber}` : ""}`,
            );
        }

        // The second player list contains the actual ranked data
        // (first is the logged-in user's own card with class "undefined")
        const rankingList = playerLists.eq(1);
        const playerItems = rankingList.children("li");

        if (playerItems.length === 0) {
            throw new HTMLParsingError(
                pageNumber,
                `No player elements found on page ${pageNumber || "unknown"}`,
            );
        }

        const records: RankedPlayerRecord[] = [];

        playerItems.each((index, li) => {
            try {
                const $li = $(li);

                // Usercode from profile link: /6/buckler/profile/{USERCODE}
                const href = $li.find("a").first().attr("href") || "";
                const hrefParts = href.split("/");
                const usercode = hrefParts[hrefParts.length - 1] || "0";

                // Player name (CFN)
                const cfn = $li.find(SELECTORS.PLAYER_NAME).text().trim();

                // Character name from portrait img alt text (skip placeholder imgs with empty alt)
                const characterName = $li.find(SELECTORS.CHARACTER).find('img[alt]:not([alt=""])').first().attr("alt") || "Unknown";

                // Country from flag img alt text (skip placeholder imgs with empty alt)
                const country = $li.find(SELECTORS.COUNTRY_FLAG).find('img[alt]:not([alt=""])').first().attr("alt") || "Unknown";

                // Rank from <dt> and MR from <dd> inside ranking_time container
                const rankMrContainer = $li.find(SELECTORS.RANK_MR);
                const rankText = rankMrContainer.find("dt").text().trim().replace("#", "");
                const mrText = rankMrContainer.find("dd").text().trim().replace(" MR", "");
                const rank = parseInt(rankText) || 0;
                const mr = parseInt(mrText) || 0;

                // League from icon filename in noscript tag
                const leagueNoscript = $li.find(SELECTORS.LEAGUE_ICON).find("noscript").html() || "";
                const league = leagueNoscript.includes("rank37_l.png") ? "Legend" : "Master";

                records.push({
                    key: records.length + 1,
                    CFN: cfn,
                    Rank: rank,
                    MR: mr,
                    Character: characterName,
                    Usercode: usercode,
                    Country: country,
                    League: league,
                });
            } catch (error) {
                this.logger.warn(
                    `Failed to parse player at index ${index} on page ${pageNumber || "unknown"}: ${error.message}`,
                );
            }
        });

        return records;
    }
}
