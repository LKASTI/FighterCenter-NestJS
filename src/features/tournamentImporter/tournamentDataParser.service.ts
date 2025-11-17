/* eslint-disable */

import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { EventService } from "../../domain/event/event.service";
import { TournamentService } from "../../domain/tournament/tournament.service";
import { PlayerService } from "../../domain/player/player.service";
import {
    StartGGTournamentDataV2ParserDTO,
} from "src/dtos/tournamentDataParser.dto";
import {
    StartGGTournamentSetRecord,
    StartGGTournamentMatchRecord,
    StartGGEventRecord,
    StartGGTournamentDataRecord,
} from "src/features/tournamentImporter/tournamentDataParsingTypes";

import { Event } from "src/domain/entities/event.entity";
import { Tournament } from "src/domain/entities/tournament.entity";
import { CreateTournamentDTO } from "src/dtos/tournament.dto";
import { Player } from "src/domain/entities/player.entity";
import { PlayerTournamentRun } from "src/domain/entities/playerTournamentRun.entity";
import { TournamentSet } from "src/domain/entities/tournamentSet.entity";
import { TournamentMatch } from "src/domain/entities/tournamentMatch.entity";
import { HttpService } from "@nestjs/axios";
import {
    startGGApiUrl,
    startggTournamentEventNamesBody,
    startggTournamentEventsBody,
} from "src/features/tournamentImporter/tournamentDataParsing.static";

import { firstValueFrom } from "rxjs";
import { EncryptionService } from "../../authentication/encryption/encryption.service";
import { StartggUser } from "../../domain/entities";
import { SFSixGamePatchService } from "../../domain/sfsixGamePatch/sfsixGamePatch.service";
import { FindSFSixGamePatchDTO } from "../../dtos/sfsixGamePatch.dto";
import { SFSixGamePatch } from "../../domain/entities/sfsixGamePatch.entity";
import { toWords } from "number-to-words";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { StartggApiService } from "../startggApi/startggApi.service";
import { Set as StartGGSet, SetConnection } from "../startggApi/startggApi.graphql"
import {
    PlayerSeriesPerformanceAggService
} from "../../domain/playerSeriesPerformanceAgg/playerSeriesPerformanceAgg.service";
import { StartggUserService } from "../../domain/startggUser/startggUser.service";
import { TaggedCacheService } from "../../common/cache/tagged-cache.service";
import { CacheTags } from "../../common/cache/cache-keys.util";

interface BatchJob {
    page: number;
    promise: Promise<{ success: true; data: SetConnection | null } | { success: false; error: any }>;
}

@Injectable()
export class TournamentDataParserService {
    constructor(
        private readonly eventService: EventService,
        private readonly tournamentService: TournamentService,
        private readonly playerService: PlayerService,
        private readonly playerSeriesPerformanceAggService: PlayerSeriesPerformanceAggService,
        private readonly sfsixGamePatchService: SFSixGamePatchService,

        private readonly httpService: HttpService,
        private readonly startggApiService: StartggApiService,

        @InjectDataSource() private dataSource: DataSource,

        private readonly encryptionService: EncryptionService,
        private readonly startggUserService: StartggUserService,
        private readonly taggedCacheService: TaggedCacheService,
    ) {}

    private readonly BATCH_REQUEST_CONFIG = {
        perPage: 23,           // Optimal for 1000 object limit
        concurrency: 2,        // Safe for rate limits
        startupDelay: 2000,    // ms - Safe startup spacing
        steadyStateDelay: 1000, // ms - Steady state spacing
        maxRetries: 3
    };

    // page number -> attempts
    private retryAttempts = new Map<number, number>();
    private failedBatches = new Set<number>();
    private consecutiveFailures = 0;

    private readonly responseStats = {
        eventID: null,
        tournamentID: null,
        playerIDs: [],
        playerTournamentRunIDs: [],
        setIDs: [],
        matchIDs: [],
        setsPerformance: [],
    };

    private mustUpdatePlayerProfileImage: boolean = false;
    private mustUpdatePlayerCountry: boolean = false;

    private req: any;
    private startggApiToken: string;

    private playerIdsForProcessing: number [] = [];

    // Map of PTRs without characters: key is "${playerId}-${tournamentId}", value is startggId (as number from StartGG API)
    // Used to track which PTRs need profile character fallback after all batches are processed
    private ptrsWithoutCharacters = new Map<string, number>();

    private static readonly seriesImportLocks = new Map<number, Promise<any>>();

    public async tournamentImporterEntry(
        params: StartGGTournamentDataV2ParserDTO,
        req: any,
        tournamentSeriesId: number
    ) {
        console.log("Received request to parse StartGG tournament data V2 for series ID:", tournamentSeriesId);

        const lockKey = tournamentSeriesId;
        if(await TournamentDataParserService.seriesImportLocks.get(lockKey)) {
            console.log(`⏳ Waiting for concurrent import to finish for event ${tournamentSeriesId}...`);
            await TournamentDataParserService.seriesImportLocks.get(lockKey);
        }

        const importPromise = this.importTournament(params, req, tournamentSeriesId);
        TournamentDataParserService.seriesImportLocks.set(lockKey, importPromise);

        try {
            console.log("🚀 Starting tournament import...");
            return await importPromise;
        } finally {
            TournamentDataParserService.seriesImportLocks.delete(lockKey);
        }
    }

    private async importTournament(
        params: StartGGTournamentDataV2ParserDTO,
        req: any,
        tournamentSeriesId: number
    ) {
        try {
            this.initializeVariables(params, req);

            // Clear the map of PTRs without characters for this new tournament import
            // This ensures clean state even if a previous import failed
            this.ptrsWithoutCharacters.clear();

            // Parse startgg url
            const { startggSlug, startggEventSlug } = this.extractSlugsFromUrl(params);

            // Check if there are multiple tournaments for this event
            const hasMultipleTournaments =
                await this.queryStartGGEventHasMultipleNames(startggSlug);

            // Get event/tournament data from startgg
            const tournamentData: StartGGTournamentDataRecord =
                await this.queryStartGGEventData(startggSlug, startggEventSlug);
            if (!tournamentData)
                throw new NotFoundException(
                    `Tournament ${startggSlug} not found`,
                );

            // Create event
            const newEvent = await this.createEvent(
                params.eventName,
                tournamentSeriesId,
                params.eventRegion,
                params.eventDates,
            );
            if (!tournamentData.events) {
                throw new NotFoundException(
                    `No tournaments found for ${startggSlug}`,
                );
            }

            // Create tournament
            const tData: StartGGEventRecord = tournamentData.events[0];
            const startggEventID = tData.id;
            // An event in startgg is a tournament in app domain
            // StartGG tournament with multiple events (multiple tournaments in app domain), must distinguish the name being stored

            // Get dates, patch, and season
            const startDate = new Date(tournamentData.startAt * 1000);
            const endDate = new Date(tournamentData.endAt * 1000);
            const [correctPatch, correctSeason] = await this.getPatchAndSeason(startDate, params);

            const parsedTournamentName = hasMultipleTournaments
                ? tournamentData.name + " " + tData.name
                : tData.name;
            const newTournament = await this.createTournament({
                tournamentName: params.tournamentName ?? parsedTournamentName,
                tournamentRegion: params.tournamentRegion ?? tournamentData.countryCode,
                dates: [startDate, endDate],
                numEntrants: tData.numEntrants,
                gameName: tData.videogame.displayName,
                gamePatch: correctPatch,
                gameSeason: correctSeason,
                eventID: newEvent.eventID,
                isOnline: tData.isOnline === true,
                tournamentType: params.tournamentType,
                vodLink: params.vodLink,
                tournamentTop8GraphicImage: params.top8GraphicUrl ?? null,
                top8GraphicIsFile: !params.top8GraphicUrl,
            });
            if (!newTournament)
                throw new BadRequestException(
                    "Tournament for given data already exists",
                );
            console.log(
                `New Tournament created:\n\tid: ${newTournament.tournamentID}\n\tname:${newTournament.tournamentName}`,
            );

            if(tData.numEntrants > 500) {
                this.BATCH_REQUEST_CONFIG.perPage = 20;
            }

            // Execute batch processing (players, PTRs, sets, matches)
            await this.processDataBatch(
                startggSlug,
                startggEventSlug,
                startggEventID.toString(),
                newTournament.tournamentID
            )

            // Update player performance agg
            this.runPlayerPerformanceAggUpdates(newEvent.eventID, Array.from(new Set(this.playerIdsForProcessing)));

            // Invalidate all caches related to this tournament import
            await this.invalidateTournamentCaches(
                this.responseStats.tournamentID as number,
                this.responseStats.eventID as number
            );

            // return stats
            return this.responseStats;
        } catch (error) {
            console.error(`❌ Tournament parsing failed:`, error.message)
            console.error(error);
            throw error;
        }
    }

    private initializeVariables(params: StartGGTournamentDataV2ParserDTO, req: any): void {
        this.req = req;
        this.startggApiToken = process.env.STARTGG_API_KEY
        if(this.req && this.req.user && this.req.user.startggEncryptedToken) {
            this.startggApiToken = this.encryptionService.decrypt((req.user as StartggUser).startggEncryptedToken);
            if(!this.startggApiToken) {
                throw new BadRequestException(
                    "StartGG API token is not set or invalid.",
                );
            }
        }
        // Initialize updater fields
        if (params.mustUpdatePlayerProfileImage)
            this.mustUpdatePlayerProfileImage =
                params.mustUpdatePlayerProfileImage;
        if (params.mustUpdatePlayerCountry)
            this.mustUpdatePlayerCountry = params.mustUpdatePlayerCountry;
    }

    private extractSlugsFromUrl(params: StartGGTournamentDataV2ParserDTO) {
        const startggUrlSplit = params.startggUrl.split("/");
        let startggSlug = params.startggSlug
            ? params.startggSlug
            : startggUrlSplit[startggUrlSplit.indexOf("tournament") + 1];
        let startggEventSlug = params.startggEventSlug
            ? params.startggEventSlug
            : startggUrlSplit[startggUrlSplit.indexOf("event") + 1];

        if (!startggSlug || !startggEventSlug)
            throw new BadRequestException(
                `StartGG Slugs could not be parsed`,
            );
        return { startggSlug, startggEventSlug };
    }

    private async getPatchAndSeason(startDate: Date, params: StartGGTournamentDataV2ParserDTO): Promise<[ patch: string, season: string ]> {
        // Get patch and season based on start date
        const gamePatchesResponse = await this.sfsixGamePatchService.findAll(new FindSFSixGamePatchDTO());
        const patches = gamePatchesResponse.data as SFSixGamePatch[];

        // Fallback
        if (!patches || patches.length === 0) {
            return [params.gamePatch ?? null, params.gameSeason ?? null];
        }

        let applicablePatch: SFSixGamePatch | null = null;

        for (const patch of patches) {
            if (startDate >= patch.date) {
                applicablePatch = patch;
            } else {
                // Stop once iterated patch after start date
                break;
            }
        }

        // Fallback
        if (!applicablePatch) {
            return [params.gamePatch ?? null, params.gameSeason ?? null];
        }

        // Convert season number to capitalized word
        const convertedSeason = toWords(applicablePatch.patchSeason);
        const correctSeason = convertedSeason.charAt(0).toUpperCase() + convertedSeason.slice(1);

        return [applicablePatch.patch, correctSeason];
    }

    private parseStartGGSetNodeRecord(
        set: StartGGSet,
    ): StartGGTournamentSetRecord {
        let round_name = set["fullRoundText"];

        let player_one_entrant_id = set["slots"][0]["entrant"]["id"];
        let player_one_id =
            set["slots"][0]["entrant"]["participants"][0]["player"]["id"];
        let player_one_name = set["slots"][0]["entrant"]["name"];
        let player_one_gamerTag =
            set["slots"][0]["entrant"]["participants"][0]["gamerTag"];
        let player_one_score = null;
        let player_one_placement =
            set["slots"][0]["entrant"]["standing"]["placement"];
        let player_one_seed = set["slots"][0]["entrant"]["initialSeedNum"];
        let player_one_country = "";
        let player_one_profile_image_url = "";
        let player_one_user =
            set["slots"][0]["entrant"]["participants"][0]["player"]["user"];
        if (player_one_user !== null) {
            const player_one_location = player_one_user["location"];
            if (player_one_location && player_one_location["country"])
                player_one_country = player_one_location["country"];

            const player_one_images = player_one_user["images"];
            if (player_one_images && player_one_images.length > 0)
                player_one_profile_image_url = player_one_images[0]["url"];
        }

        let player_two_entrant_id = set["slots"][1]["entrant"]["id"];
        let player_two_id =
            set["slots"][1]["entrant"]["participants"][0]["player"]["id"];
        let player_two_name = set["slots"][1]["entrant"]["name"];
        let player_two_gamerTag =
            set["slots"][1]["entrant"]["participants"][0]["gamerTag"];
        let player_two_score = null;
        let player_two_placement =
            set["slots"][1]["entrant"]["standing"]["placement"];
        let player_two_seed = set["slots"][1]["entrant"]["initialSeedNum"];
        let player_two_country = "";
        let player_two_profile_image_url = "";
        let player_two_user =
            set["slots"][1]["entrant"]["participants"][0]["player"]["user"];
        if (player_two_user !== null) {
            const player_two_location = player_two_user["location"];
            if (player_two_location && player_two_location["country"])
                player_two_country = player_two_location["country"];

            const player_two_images = player_two_user["images"];
            if (player_two_images && player_two_images.length > 0)
                player_two_profile_image_url = player_two_images[0]["url"];
        }

        // parse score for each player
        let scores = set["displayScore"].split(" - ");
        for (const score of scores) {
            if (score.includes(player_one_name) && player_one_score === null) {
                player_one_score = score.replace(player_one_name + " ", "");
            } else if (score.includes(player_two_name)) {
                player_two_score = score.replace(player_two_name + " ", "");
            }
        }

        let matches_to_win = 0;
        if (set.setGamesType === 1) {
            matches_to_win =
                Math.floor(set.totalGames / 2) + (set.totalGames % 2);
        }

        let winner_name =
            // @ts-ignore
            set.winnerId === player_one_entrant_id
                ? player_one_gamerTag
                : player_two_gamerTag;

        let player_one_characters = [];
        let player_two_characters = [];
        let matches: StartGGTournamentMatchRecord[] = [];

        if (set.games) {
            for (const game of set.games) {
                // parse winner name, and match number
                let order_num = game.orderNum;
                winner_name =
                    // @ts-ignore
                    game.winnerId === player_one_entrant_id
                        ? player_one_gamerTag
                        : player_two_gamerTag;

                let player_one_character = null;
                let player_two_character = null;

                // get p1 and p2 character and update character lists for each
                if (game.selections) {
                    for (const selection of game.selections) {
                        if (selection.entrant.id === player_one_entrant_id) {
                            if (selection.character) {
                                player_one_character = selection.character.name;
                                if (
                                    !player_one_characters.includes(
                                        player_one_character,
                                    )
                                )
                                    player_one_characters.push(
                                        player_one_character,
                                    );
                            }
                        } else if (
                            selection.entrant.id === player_two_entrant_id
                        ) {
                            if (selection.character) {
                                player_two_character = selection.character.name;
                                if (
                                    !player_two_characters.includes(
                                        player_two_character,
                                    )
                                )
                                    player_two_characters.push(
                                        player_two_character,
                                    );
                            }
                        }
                    }
                }

                // add to list of matches
                matches.push({
                    match_id: parseInt(game.id),
                    match_number: order_num,
                    player_one_character: player_one_character,
                    player_two_character: player_two_character,
                    winner_name: winner_name,
                });
            }
        }

        const newSet: StartGGTournamentSetRecord = {
            set_id: parseInt(set.id),

            player_one_name: player_one_gamerTag,
            player_two_name: player_two_gamerTag,

            player_one_score: player_one_score,
            player_two_score: player_two_score,

            player_one_placement: player_one_placement,
            player_two_placement: player_two_placement,

            player_one_seed: player_one_seed,
            player_two_seed: player_two_seed,

            player_one_startgg_id: parseInt(player_one_id),
            player_two_startgg_id: parseInt(player_two_id),

            player_one_characters: player_one_characters,
            player_two_characters: player_two_characters,

            player_one_country: player_one_country,
            player_two_country: player_two_country,

            player_one_profile_image_url: player_one_profile_image_url,
            player_two_profile_image_url: player_two_profile_image_url,

            matches_to_win: matches_to_win,
            winner_name: winner_name,
            round_id: set.round,
            round_name: round_name,
            phase_name: set.phaseGroup.phase.name,
            matches: matches,
        };

        return newSet;
    }

    private processingPromises = new Set<Promise<void>>();

    //#region Batch Processing
    private async processDataBatch(
        slug: string,
        eventSlug: string,
        eventId: string,
        tournamentId: number
    ) {
        const activeBatches = new Map<number, BatchJob>();
        let currentPage = 1;
        let totalPages: number | null = null;
        let processedBatches = 0;

        console.log('🔄 Starting optimized batch processing...');

        // Phase 1: Carefully spaced startup
        currentPage = await this.startInitialBatches(
            slug,
            eventSlug,
            eventId,
            this.BATCH_REQUEST_CONFIG.concurrency,
            activeBatches
        );

        // Phase 2: Process batches as they complete
        while (activeBatches.size > 0) {
            console.log(`⏳ Waiting for next batch to complete... Active batches: ${activeBatches.size}`);
            try {
                const completedPage = await this.waitForNextBatch(activeBatches);
                const result = await activeBatches.get(completedPage)!.promise;
                // Result is already unwrapped by waitForNextBatch, so it's guaranteed to be success
                const setsResponse = result.success ? result.data : null;
                activeBatches.delete(completedPage);
                console.log(`� Batch ${completedPage} data retrieved`);

                // Update total pages on first response
                if (totalPages === null && setsResponse?.pageInfo?.totalPages) {
                    totalPages = setsResponse.pageInfo.totalPages;
                    console.log(`📊 Total pages to process: ${totalPages}`);
                }

                // Process this batch immediately (don't await - parallel processing)
                if (setsResponse?.nodes?.length) {
                    const processingPromise = this.processBatch(setsResponse.nodes, tournamentId, ++processedBatches, totalPages);
                    this.processingPromises.add(processingPromise);
                    // Clean up completed promises
                    processingPromise.finally(() => {
                        this.processingPromises.delete(processingPromise);
                    });

                    // Limit concurrent processing
                    if (this.processingPromises.size >= 3) {
                        // Wait for at least one to complete before starting next API call
                        await Promise.race(this.processingPromises);
                    }
                }

                // Start next batch if available
                if (totalPages && currentPage <= totalPages) {
                    await this.delay(this.BATCH_REQUEST_CONFIG.steadyStateDelay);
                    this.startBatch(slug, eventSlug, eventId, currentPage, activeBatches);
                    currentPage++;
                }

            } catch (error) {
                const failedPage = (error as any).failedPage;
                // Remove the failed batch from active batches
                if (failedPage !== undefined) {
                    activeBatches.delete(failedPage);
                }
                await this.handleBatchError(error, slug, eventSlug, eventId, activeBatches, failedPage);
            }
        }

        // Wait for all batch processing to complete
        if (this.processingPromises.size > 0) {
            console.log(`⏳ Waiting for ${this.processingPromises.size} remaining batch processing tasks to complete...`);
            await Promise.all(this.processingPromises);
        }

        // Apply character fallback for PTRs that have no characters after all batches
        await this.applyProfileCharacterFallback(tournamentId);

        console.log('✅ Tournament processing completed!');
    }

    private async handleBatchError(
        error: any,
        slug: string,
        eventSlug: string,
        eventId: string,
        activeBatches: Map<number, BatchJob>,
        failedPage?: number
    ) {
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
            console.log('⚠️  Rate limit hit, implementing backoff...');

            // Check if we can reduce perPage further
            if (this.BATCH_REQUEST_CONFIG.perPage <= 0) {
                console.error('❌ Cannot reduce perPage further (already at 0). Rate limit cannot be resolved.');
                throw new Error('RATE_LIMIT_UNRESOLVABLE: perPage reached 0');
            }

            this.consecutiveFailures++;

            // Reduce perPage immediately
            const newPerPage = Math.max(0, this.BATCH_REQUEST_CONFIG.perPage - 3);
            console.log(`📉 Reducing perPage from ${this.BATCH_REQUEST_CONFIG.perPage} to ${newPerPage}`);
            this.BATCH_REQUEST_CONFIG.perPage = newPerPage;

            const retryCount = this.retryAttempts.get(failedPage || 0) || 0;

            if (retryCount < 2) { // Allow 2 immediate retries
                // Immediate retry with exponential backoff + jitter
                const baseDelay = 3000 * Math.pow(1.2, retryCount);
                const jitter = Math.random() * 1000;
                const backoffTime = Math.min(30000, baseDelay + jitter);

                await this.delay(backoffTime);
                this.retryAttempts.set(failedPage || 0, retryCount + 1);

                if (failedPage) {
                    this.startBatch(slug, eventSlug, eventId, failedPage, activeBatches);
                }
            } else {
                // Queue for end-of-process retry
                if (failedPage) {
                    this.failedBatches.add(failedPage);
                    console.log(`📝 Page ${failedPage} queued for final retry phase`);
                }
            }

            // Global rate limiting adjustment
            if (this.consecutiveFailures >= 3) {
                console.log('🐌 Slowing down all requests due to repeated failures');
                this.BATCH_REQUEST_CONFIG.steadyStateDelay *= 1.2; // Slow down by 50%
            }
        } else {
            console.error(`❌ Batch processing error:`, error.message);
            throw error;
        }
    }

    private async startInitialBatches(
        slug: string,
        eventSlug: string,
        eventId: string,
        concurrency: number,
        activeBatches: Map<number, BatchJob>
    ): Promise<number> {
        let currentPage = 1;

        console.log(`🟡 Starting ${concurrency} initial batches...`);

        for (let i = 0; i < concurrency; i++) {
            this.startBatch(slug, eventSlug, eventId, currentPage, activeBatches);
            currentPage++;

            // Rate limiting delay (except for last batch)
            if (i < concurrency - 1) {
                await this.delay(this.BATCH_REQUEST_CONFIG.startupDelay);
            }
        }

        return currentPage;
    }

    private startBatch(
        slug: string,
        eventSlug: string,
        eventId: string,
        page: number,
        activeBatches: Map<number, BatchJob>
    ) {
        // No await call - start request immediately
        // Convert rejections to resolved promises with error info to prevent unhandled rejections
        const promise = this.startggApiService.getTournamentSets(
            slug,
            eventSlug,
            eventId,
            page,
            this.BATCH_REQUEST_CONFIG.perPage
        ).then(
            (data) => ({ success: true as const, data }),
            (error) => ({ success: false as const, error })
        );

        activeBatches.set(page, { page, promise });
        console.log(`📡 Started batch ${page}`);
    }

    private async waitForNextBatch(activeBatches: Map<number, BatchJob>): Promise<number> {
        const batchPromises = Array.from(activeBatches.entries()).map(
            async ([page, job]) => {
                const result = await job.promise;
                return { page, result };
            }
        );

        // Returns the first promise to settle
        const { page, result } = await Promise.race(batchPromises);

        // If there was an error, throw it with the page info attached
        if (result.success === false) {
            const error = result.error;
            (error as any).failedPage = page;
            throw error;
        }

        return page;
    }

    private async processBatch(
        sets: StartGGSet[],
        tournamentId: number,
        batchNumber: number,
        totalBatches: number | null
    ) {
        const validSets = sets.filter(set =>
            set?.slots?.length === 2 && set.winnerId
        );

        if (validSets.length === 0) {
            console.log(`⚠️  Batch ${batchNumber}: No valid sets found`);
            return;
        }

        console.log(`🔄 Processing batch ${batchNumber}${totalBatches ? `/${totalBatches}` : ''}: ${validSets.length} sets`);

        // Convert to internal format
        const parsedSets = validSets.map(set => this.parseStartGGSetNodeRecord(set));
        // Get player to characters used
        const playerCharacterMap = this.aggregateCharactersByPlayer(parsedSets);
        // Batch operations
        // startggId -> playerId
        const playerIdMap = await this.createPlayersAndPTRsBatched(tournamentId, parsedSets, playerCharacterMap);
        this.playerIdsForProcessing.push(...Array.from(playerIdMap.values()));
        // Create sets
        const tournamentSetIdMap = await this.createTournamentSetsBatched(parsedSets, tournamentId, playerIdMap);
        // Create matches
        await this.createTournamentMatchesBatched(
            parsedSets,
            tournamentSetIdMap
        )

        console.log(`✅ Completed batch ${batchNumber}: ${parsedSets.length} sets processed`);
    }
    //#endregion

    private aggregateCharactersByPlayer(setsData: StartGGTournamentSetRecord[]): Map<number, Set<string>> {
        const playerCharacters = new Map<number, Set<string>>();

        setsData.forEach(set => {
            // Process entrant 1
            if (set.player_one_startgg_id) {
                if (!playerCharacters.has(set.player_one_startgg_id)) {
                    playerCharacters.set(set.player_one_startgg_id, new Set<string>());
                }
                set.player_one_characters.forEach(char => {
                    playerCharacters.get(set.player_one_startgg_id)!.add(char);
                });
            }

            // Process entrant 2
            if (set.player_two_startgg_id) {
                if (!playerCharacters.has(set.player_two_startgg_id)) {
                    playerCharacters.set(set.player_two_startgg_id, new Set<string>());
                }
                set.player_two_characters.forEach(char => {
                    playerCharacters.get(set.player_two_startgg_id)!.add(char);
                });
            }
        });

        return playerCharacters;
    }

    /**
     * Fetch SF6 profile characters for a player from their startgg_user record.
     * This is used as a fallback when no character data is available from tournament sets.
     *
     * @param startggId The player's StartGG ID
     * @returns Array of character names from their profile, or empty array if not found
     */
    private async getProfileCharactersForPlayer(startggId: number): Promise<string[]> {
        try {
            const startggUser = await this.startggUserService.findByStartggId(String(startggId));
            if (startggUser && startggUser.sf6ProfileCharacters && startggUser.sf6ProfileCharacters.length > 0) {
                return startggUser.sf6ProfileCharacters;
            }
        } catch (error) {
            console.warn(`Failed to fetch profile characters for startggId ${startggId}:`, error.message);
        }
        return [];
    }

    /**
     * Apply profile character fallback for PTRs that have no characters after all batches are processed.
     * This method iterates through the ptrsWithoutCharacters map and updates each PTR with characters
     * from the player's startgg_user profile (sf6ProfileCharacters field).
     *
     * @param tournamentId The tournament ID to update PTRs for
     */
    private async applyProfileCharacterFallback(tournamentId: number): Promise<void> {
        if (this.ptrsWithoutCharacters.size === 0) {
            console.log('No PTRs need character fallback');
            return;
        }

        console.log(`Applying profile character fallback for ${this.ptrsWithoutCharacters.size} PTRs...`);

        const updatePromises = [];

        for (const [ptrKey, startggId] of this.ptrsWithoutCharacters.entries()) {
            // Fetch profile characters for this player
            const profileCharacters = await this.getProfileCharactersForPlayer(startggId);

            if (profileCharacters.length > 0) {
                // Parse the ptrKey to get playerId and tournamentId
                const [playerId, tournamentIdFromKey] = ptrKey.split('-').map(Number);

                console.log(`Updating PTR for player ${playerId} with profile characters: ${profileCharacters.join(', ')}`);

                // Update the PTR with profile characters
                const updatePromise = this.dataSource
                    .createQueryBuilder()
                    .update(PlayerTournamentRun)
                    .set({ charactersUsed: profileCharacters })
                    .where('player_id = :playerId AND tournament_id = :tournamentId', {
                        playerId: playerId,
                        tournamentId: tournamentId
                    })
                    .execute();

                updatePromises.push(updatePromise);
            }
        }

        await Promise.all(updatePromises);

        console.log(`✅ Applied profile character fallback to ${updatePromises.length} PTRs`);

        // Clear the map after applying fallback
        this.ptrsWithoutCharacters.clear();
    }

    //#region StartGG API request calls
    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async queryStartGGEventData(
        slug: string,
        eventSlug: string,
    ): Promise<StartGGTournamentDataRecord> {
        const eventsResponse = await firstValueFrom(
            this.httpService.post(
                startGGApiUrl,
                JSON.stringify({
                    query: startggTournamentEventsBody,
                    variables: { slug: slug, eventSlug: eventSlug },
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.startggApiToken}`,
                    },
                },
            ),
        );

        return eventsResponse.data.data.tournament;
    }

    private async queryStartGGEventHasMultipleNames(
        slug: string,
    ): Promise<Boolean> {
        const eventsResponse = await firstValueFrom(
            this.httpService.post(
                startGGApiUrl,
                JSON.stringify({
                    query: startggTournamentEventNamesBody,
                    variables: { slug: slug },
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.startggApiToken}`,
                    },
                },
            ),
        );

        const eventsData = eventsResponse.data.data.tournament;
        if (eventsData && eventsData.events)
            return eventsData.events.length > 1;
    }
    //#endregion

    //#region Methods to update database with
    private async createEvent(
        eventName: string,
        tournamentSeriesId: number,
        eventRegion: string | null,
        eventDates: Date[] | null,
    ): Promise<Event> {
        let event: Event;
        // const eventsQuery = await this.eventService.findAll({
        //     eventName: eventName,
        //     dates: eventDates,
        //     region: eventRegion,
        // });
        const eventsQuery = await this.eventService.findById(tournamentSeriesId);

        if (eventsQuery) {
            event = eventsQuery;
        } else {
            event = await this.eventService.create({
                eventName: eventName,
                region: eventRegion,
                dates: eventDates,
            });

            console.log(
                `New event created:\n\tid: ${event.eventID}\n\tname: ${event.eventName}`,
            );
        }

        // Update stats
        this.responseStats["eventID"] = event.eventID;

        return event;
    }

    private async createTournament(
        createTournamentDTO: CreateTournamentDTO,
    ): Promise<Tournament> {
        // dates is not considered when finding tournaments
        const tournamentsQuery = await this.tournamentService.findAll({
            tournamentName: createTournamentDTO.tournamentName,
            gameName: createTournamentDTO.gameName,
            eventID: createTournamentDTO.eventID,
        });

        // console.log(tournamentsQuery)

        if (tournamentsQuery.meta["total"] > 0) return null;

        const newTourney =
            await this.tournamentService.create(createTournamentDTO);

        // Update stats
        this.responseStats["tournamentID"] = newTourney.tournamentID;

        return newTourney;
    }

    private async createPlayersAndPTRsBatched(
        tournamentID: number,
        setsData: StartGGTournamentSetRecord[],
        playerCharacterMap: Map<number, Set<string>>
    ) {
        const playerRepo = this.dataSource.getRepository(Player);
        const ptrRepo = this.dataSource.getRepository(PlayerTournamentRun);

        // Step 1: Collect all unique players with their data
        const playersMap = new Map<number, {
            name: string;
            country: string;
            placement: number;
            seed: number;
            profileImageUrl: string;
            startggId: number;
        }>();

        for (const set of setsData) {
            // Collect player one data
            if (!playersMap.has(set.player_one_startgg_id)) {
                playersMap.set(set.player_one_startgg_id, {
                    name: set.player_one_name,
                    country: set.player_one_country || null,
                    placement: set.player_one_placement,
                    seed: set.player_one_seed,
                    profileImageUrl: set.player_one_profile_image_url || null,
                    startggId: set.player_one_startgg_id
                });
            }

            // Collect player two data
            if (!playersMap.has(set.player_two_startgg_id)) {
                playersMap.set(set.player_two_startgg_id, {
                    name: set.player_two_name,
                    country: set.player_two_country || null,
                    placement: set.player_two_placement,
                    seed: set.player_two_seed,
                    profileImageUrl: set.player_two_profile_image_url || null,
                    startggId: set.player_two_startgg_id
                });
            }
        }

        const playerStartggIds = Array.from(playersMap.keys());

        // Step 2: Find existing players in single query
        const existingPlayers = await this.dataSource
            .getRepository(Player)
            .createQueryBuilder('player')
            .where('player.startggPlayerID IN (:...ids)', { ids: playerStartggIds })
            .getMany();

        const existingPlayerMap = new Map(
            existingPlayers.map(p => [p.startggPlayerID, p.playerID])
        );

        // Step 3: Bulk create missing players
        const missingPlayerData = [];
        for (const [startggId, playerData] of playersMap) {
            if (!existingPlayerMap.has(startggId)) {
                const player = new Player();
                player.startggPlayerID = startggId;
                player.playerName = playerData.name;
                player.country = playerData.country;
                player.startggProfileImageURL = playerData.profileImageUrl;
                missingPlayerData.push(player);
            }
        }
        if (missingPlayerData.length > 0) {
            const savedPlayers = await playerRepo.save(missingPlayerData);

            // ✅ Direct access to entity properties
            savedPlayers.forEach(player => {
                existingPlayerMap.set(player.startggPlayerID, player.playerID);
                this.responseStats["playerIDs"].push(player.playerID);
            });
        }

        // Step 4: Handle player updates (profile image and country) if flags are set
        if (this.mustUpdatePlayerCountry || this.mustUpdatePlayerProfileImage) {
            const updatePromises = [];
            for (const [startggId, playerData] of playersMap) {
                const playerId = existingPlayerMap.get(startggId);
                if (playerId && existingPlayers.some(p => p.startggPlayerID === startggId)) {
                    const updateData: any = {};
                    if (this.mustUpdatePlayerCountry) {
                        updateData.country = playerData.country;
                    }
                    if (this.mustUpdatePlayerProfileImage) {
                        updateData.startggProfileImageURL = playerData.profileImageUrl;
                    }

                    if (Object.keys(updateData).length > 0) {
                        updatePromises.push(
                            this.playerService.update(playerId, updateData)
                        );
                    }
                }
            }
            await Promise.all(updatePromises);
        }

        // Step 5: Check existing player tournament runs
        const existingPTRs = await this.dataSource
            .getRepository(PlayerTournamentRun)
            .createQueryBuilder('ptr')
            .where('ptr.player_id IN (:...playerIds)', { playerIds: Array.from(existingPlayerMap.values()) })
            .andWhere('ptr.tournament_id = :tournamentId', { tournamentId: tournamentID })
            .getMany();

        const existingPTRMap = new Map<string, PlayerTournamentRun>();
        existingPTRs.forEach(ptr => {
            const key = `${ptr.playerID}-${ptr.tournamentID}`;
            existingPTRMap.set(key, ptr);
        });

        // Step 6: Bulk create missing player tournament runs
        const newPTRData = [];
        const updatePTRData = [];

        for (const [startggId, playerData] of playersMap) {
            const playerId = existingPlayerMap.get(startggId);
            if (!playerId) return;

            const ptrKey = `${playerId}-${tournamentID}`;

            const batchCharacters = Array.from(playerCharacterMap.get(startggId) || []);
            const existingPTR = existingPTRMap.get(ptrKey);

            if (existingPTR) {
                // 🟢 UPDATE: Merge characters with existing PTR
                const existingCharacters = new Set(existingPTR.charactersUsed || []);
                batchCharacters.forEach(char => existingCharacters.add(char));

                const mergedCharacters = Array.from(existingCharacters);

                updatePTRData.push({
                    playerID: playerId,
                    tournamentID: tournamentID,
                    charactersUsed: mergedCharacters
                });

                // Track or remove from map based on whether characters exist after merge
                if (mergedCharacters.length === 0) {
                    // Still no characters after merge, add/keep in map for fallback
                    this.ptrsWithoutCharacters.set(ptrKey, startggId);
                } else {
                    // Has characters now, remove from map (no fallback needed)
                    this.ptrsWithoutCharacters.delete(ptrKey);
                }
            } else {
                // 🟢 CREATE: New PTR with characters
                newPTRData.push({
                    playerID: playerId,
                    tournamentID: tournamentID,
                    playerEntryName: playerData.name,
                    placement: playerData.placement,
                    seed: playerData.seed,
                    charactersUsed: batchCharacters
                });

                // Track PTRs without characters for fallback later
                if (batchCharacters.length === 0) {
                    this.ptrsWithoutCharacters.set(ptrKey, startggId);
                }

                // Update stats
                this.responseStats["playerTournamentRunIDs"].push([playerId, tournamentID]);
            }
        }

        //TODO parallelism on both new and update operations
        if (newPTRData.length > 0) {
            await ptrRepo
                .createQueryBuilder()
                .insert()
                .values(newPTRData)
                .orIgnore()
                .execute();
        }

        if (updatePTRData.length > 0) {
            const updatePromises = updatePTRData.map(update =>
                this.dataSource
                    .createQueryBuilder()
                    .update(PlayerTournamentRun)
                    .set({ charactersUsed: update.charactersUsed })
                    .where('player_id = :playerId AND tournament_id = :tournamentId', {
                        playerId: update.playerID,
                        tournamentId: update.tournamentID
                    })
                    .execute()
            );

            await Promise.all(updatePromises);
        }

        if(existingPlayerMap.size === 0) {
            console.log(`🟢 No existing players found,`);
        }

        return existingPlayerMap; // Return startggId -> playerId mapping for use in createSets
    }

    private async createTournamentSetsBatched(
        setsData: StartGGTournamentSetRecord[],
        tournamentId: number,
        playerIdMap: Map<number, number>
    ): Promise<Map<number, number>> { // Map: startggSetId -> tournamentSetId
        const tournamentSets = [];
        const startggSetIds = [];

        const setRepo = this.dataSource.getRepository(TournamentSet);

        for (const set of setsData) {
            const playerOneId = playerIdMap.get(set.player_one_startgg_id);
            const playerTwoId = playerIdMap.get(set.player_two_startgg_id);

            if (playerOneId && playerTwoId) {
                const tournamentSet = new TournamentSet();
                tournamentSet.tournamentID = tournamentId;
                tournamentSet.playerOneID = playerOneId;
                tournamentSet.playerTwoID = playerTwoId;
                tournamentSet.startggSetID = set.set_id;
                tournamentSet.bracketName = set.phase_name;
                tournamentSet.bracketRound = set.round_name;
                tournamentSet.matchesToWin = set.matches_to_win;
                tournamentSet.winnerID = set.player_one_score > set.player_two_score
                    ? playerOneId
                    : playerTwoId;
                tournamentSet.winnerName = set.winner_name;

                tournamentSets.push(tournamentSet);
                startggSetIds.push(set.set_id);
            }
        }

        // startgg set id -> tournament set id
        const setIdMap = new Map<number, number>();

        if (tournamentSets.length > 0) {
            // 🟢 INSERT AND RETURN IDs
            const savedSets = await setRepo.save(tournamentSets);

            // ✅ Direct access to entity properties
            savedSets.forEach(set => {
                setIdMap.set(set.startggSetID, set.tournamentSetID);
                this.responseStats.setIDs.push(set.tournamentSetID);
            });
        }

        return setIdMap;
    }

    private async createTournamentMatchesBatched(
        setsData: StartGGTournamentSetRecord[],
        tournamentSetIds: Map<number, number>
    ) {
        const tournamentMatches = [];

        const matchRepo = this.dataSource.getRepository(TournamentMatch);

        for (const set of setsData) {
            const tournamentSetId = tournamentSetIds.get(set.set_id);

            if (!tournamentSetId || set.matches.length === 0) {
                continue;
            }

            // Create a match record for each match in the set
            set.matches.forEach(match => {
                const tournamentMatch = new TournamentMatch();
                tournamentMatch.tournamentSetID = tournamentSetId;
                tournamentMatch.winnerName = match.winner_name;
                tournamentMatch.matchNumber = match.match_number;
                tournamentMatch.playerOneCharacter = match.player_one_character || '';
                tournamentMatch.playerTwoCharacter = match.player_two_character || '';
                tournamentMatches.push(tournamentMatch);
            });
        }

        if (tournamentMatches.length > 0) {
            const savedMatches = await matchRepo.save(tournamentMatches);

            savedMatches.forEach(match => {
                this.responseStats.matchIDs.push(match.tournamentMatchID);
            });
        }
    }
    //#endregion

    // Update Player Performance Aggs
    private runPlayerPerformanceAggUpdates(
        eventSeriesID: number,
        playerIDs: number[] | undefined
    ) {
        setImmediate(async () => {
           try {
               await this.delay(1000);
               const items = await this.playerSeriesPerformanceAggService.getAllForSeriesTable(eventSeriesID);
               if (items.length > 0) {
                   await this.playerSeriesPerformanceAggService.updateAllForSeries(eventSeriesID, playerIDs);
               } else {
                   await this.playerSeriesPerformanceAggService.updateAllForSeries(eventSeriesID);
               }
           } catch {
                console.error('Error updating player performance aggs in background');
           }
        });
    }

    /**
     * Invalidate all caches related to a tournament and its event series
     * Called after tournament import completes
     */
    private async invalidateTournamentCaches(tournamentId: number, eventSeriesId: number): Promise<void> {
        await this.taggedCacheService.invalidateByTags([
            // Specific tournament caches
            CacheTags.tournament.byId(tournamentId),
            // Event-level caches (affects all tournaments in the event, player performance, etc.)
            CacheTags.tournament.event(eventSeriesId),
            // Tournament list caches
            CacheTags.tournament.allLists(),
            // Player performance caches for this event
            CacheTags.playerSeriesPerformance.event(eventSeriesId),
        ]);
    }
}
