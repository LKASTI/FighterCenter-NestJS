/* eslint-disable */

import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { EventService } from "../../domain/event/event.service";
import { TournamentService } from "../../domain/tournament/tournament.service";
import { PlayerService } from "../../domain/player/player.service";
import { PlayerTournamentRunService } from "../../domain/playerTournamentRun/playerTournamentRun.service";
import { TournamentSetService } from "../../domain/tournamentSet/tournamentSet.service";
import { TournamentMatchService } from "../../domain/tournamentMatch/tournamentMatch.service";
import {
    StartGGTournamentDataParserDTO,
    StartGGTournamentDataV2ParserDTO,
} from "src/dtos/tournamentDataParser.dto";
import {
    StartGGTournamentPlayerRecord,
    StartGGTournamentSetRecord,
    StartGGTournamentMatchRecord,
    StartGGEventRecord,
    StartGGTournamentDataRecord,
    StartGGTournamentSetNodeRecord,
} from "src/features/tournamentImporter/tournamentDataParsingTypes";

import * as path from "path";
import * as fs from "fs/promises";
import { Event } from "src/domain/entities/event.entity";
import { Tournament } from "src/domain/entities/tournament.entity";
import { CreateTournamentDTO } from "src/dtos/tournament.dto";
import { Player } from "src/domain/entities/player.entity";
import { PlayerTournamentRun } from "src/domain/entities/playerTournamentRun.entity";
import { TournamentSet } from "src/domain/entities/tournamentSet.entity";
import { TournamentMatch } from "src/domain/entities/tournamentMatch.entity";
import { CreateTournamentSetDTO } from "src/dtos/tournamentSet.dto";
import { CreateTournamentMatchDTO } from "src/dtos/tournamentMatch.dto";
import { HttpService } from "@nestjs/axios";
import {
    startGGApiUrl,
    startggTournamentEventNamesBody,
    startggTournamentEventsBody,
    startggTournamentSetsBody,
} from "src/features/tournamentImporter/tournamentDataParsing.static";
import { ConfigService } from "@nestjs/config";

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
import { Set as StartGGSet } from "../startggApi/startggApi.graphql"

@Injectable()
export class TournamentDataParserService {
    constructor(
        private readonly eventService: EventService,
        private readonly tournamentService: TournamentService,
        private readonly playerService: PlayerService,
        private readonly playerTournamentRunService: PlayerTournamentRunService,
        private readonly tournamentSetService: TournamentSetService,
        private readonly tournamentMatchService: TournamentMatchService,
        private readonly sfsixGamePatchService: SFSixGamePatchService,

        private readonly httpService: HttpService,
        private readonly startggApiService: StartggApiService,

        private readonly configService: ConfigService,

        @InjectDataSource() private dataSource: DataSource,

        private readonly encryptionService: EncryptionService
    ) {}

    private readonly setsPath: string =
        "src/TEMPDATA/TournamentData/StartGG/Sets";
    // private playersPath: string = 'src/TEMPDATA/TournamentData/StartGG/Players' // DEPRECATED

    // Initialize response stats
    private readonly responseStats = {
        eventID: null,
        tournamentID: null,
        playerIDs: [],
        playerTournamentRunIDs: [],
        setIDs: [],
        matchIDs: [],
        setsPerformance: [],
    };

    private startggPerPage = 20;
    private startggRequestDelayMs = 1000;

    private mustUpdatePlayerProfileImage: boolean = false;
    private mustUpdatePlayerCountry: boolean = false;

    private setLimit: number = 999999999;

    private req: any;
    private startggApiToken: string;

    public async parseStartGGTournamentDataV2(
        params: StartGGTournamentDataV2ParserDTO,
        req: any,
        tournamentSeriesId: number
    ) {
        try {
            this.initializeVariables(params, req);

            // Parse startgg url
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

            // Get and parse players and set data from startgg
            const setsData: StartGGTournamentSetRecord[] =
                await this.getStartGGSetsData(
                    startggSlug,
                    startggEventID,
                    startggEventSlug,
                );

            // Create players
            console.time("createPlayers");
            // await this.createPlayers(newTournament.tournamentID, setsData);
            const playerIdMap = await this.createPlayersBatched(newTournament.tournamentID, setsData);
            console.timeEnd("createPlayers");

            // Create Sets and Matches
            const res = await this.createSets(
                setsData,
                newTournament.tournamentID,
                playerIdMap
            );

            // return stats
            return this.responseStats;
        } catch (error) {
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
        // Initialize API request limiting fields (perPage, delay)
        if (params.requestDelay)
            this.startggRequestDelayMs = params.requestDelay;
        if (params.perPageCount) this.startggPerPage = params.perPageCount;
        // Initialize updater fields
        if (params.mustUpdatePlayerProfileImage)
            this.mustUpdatePlayerProfileImage =
                params.mustUpdatePlayerProfileImage;
        if (params.mustUpdatePlayerCountry)
            this.mustUpdatePlayerCountry = params.mustUpdatePlayerCountry;
        // Initialize set limit for startgg api
        if (params.setLimit) this.setLimit = params.setLimit;
    }

    private async getPatchAndSeason(startDate: Date, params: StartGGTournamentDataV2ParserDTO): Promise<[ patch: string, season: string ]> {
        // Get patch and season based on start date
        const gamePatchesResponse = await this.sfsixGamePatchService.findAll(new FindSFSixGamePatchDTO());
        const patches = gamePatchesResponse.data as SFSixGamePatch[];

        let correctPatch = '';
        let correctSeason = '';
        if(patches && patches.length > 1) {
            let prevEle = patches[0];
            for(let i = 1; i <= patches.length - 1; i += 1) {
                const currentEle = patches[i];
                if(startDate > currentEle.date) {
                    prevEle = patches[i];
                    continue;
                }
                correctPatch = prevEle.patch;
                const convertedSeason = toWords(prevEle.patchSeason);
                correctSeason = convertedSeason.charAt(0).toUpperCase() + convertedSeason.slice(1);
                break
            }
        } else {
            correctPatch = params.gamePatch ?? null;
            correctSeason = params.gameSeason ?? null;
        }
        return [correctPatch, correctSeason];
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
            set.winnerId.toString() === player_one_entrant_id
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
                    game.winnerId?.toString() === player_one_entrant_id
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

    //#region StartGG API request calls
    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async getStartGGSetsData(
        slug: string,
        startggEventID: number,
        startggEventSlug: string,
    ): Promise<StartGGTournamentSetRecord[]> {
        // Build list of JSON objects
        const setsData: StartGGTournamentSetRecord[] = [];
        let page = 1;
        let perPage = this.startggPerPage;
        let goToNextPage = true;
        let setCount = 0;
        while (goToNextPage && setCount <= this.setLimit) {
            console.log("Page " + String(page));
            // Query StartGG for tournament sets
            const setResponse = await this.startggApiService.getTournamentSets(
                slug,
                startggEventSlug,
                startggEventID.toString(),
                page,
                perPage
            )
            if (!setResponse?.nodes || setResponse.nodes.length === 0)
                throw new NotFoundException(
                    `No data received from set query for eventId: ${startggEventID} and slug: ${slug}.\nTry increasing the delay or lowering the perPage count.`,
                );
            setCount += perPage;
            // Parse sets into StartGGTournamentSetRecords
            for (const set of setResponse.nodes) {
                // If a play is null, bye skip
                if (set.slots.length !== 2 || !set.winnerId) continue;

                // Get new set record and add to list
                const parsedSetNode: StartGGTournamentSetRecord =
                    this.parseStartGGSetNodeRecord(set);

                setsData.push(parsedSetNode);
            }

            // Delay to not overwhelm startgg API
            await this.delay(this.startggRequestDelayMs);

            if (setResponse.nodes.length < perPage) goToNextPage = false;
            else page += 1;
        }
        console.log(
            `All sets for slug: ${slug} and eventID: ${startggEventID} and eventSlug: ${startggEventSlug} retrieved and parsed`,
        );

        return setsData;
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

    private async createPlayersBatched(
        tournamentID: number,
        setsData: StartGGTournamentSetRecord[],
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
        const existingPlayers = await playerRepo
            .createQueryBuilder('player')
            .select(['player.playerID', 'player.startggPlayerID'])
            .where('player.startggPlayerID IN (:...ids)', { ids: playerStartggIds })
            .getRawMany();

        const existingPlayerMap = new Map(
            existingPlayers.map(p => [p.player_startgg_player_id, p.player_player_id])
        );

        // Step 3: Bulk create missing players
        const missingPlayerData = [];
        for (const [startggId, playerData] of playersMap) {
            if (!existingPlayerMap.has(startggId)) {
                missingPlayerData.push({
                    playerName: playerData.name,
                    startggPlayerId: startggId,
                    country: playerData.country,
                    startggProfileImageURL: playerData.profileImageUrl
                });
            }
        }

        if (missingPlayerData.length > 0) {
            const insertResult = await playerRepo
                .createQueryBuilder()
                .insert()
                .values(missingPlayerData)
                .returning(['playerID', 'startggPlayerID'])
                .execute();

            // Update existing player map with new players
            insertResult.raw.forEach(player => {
                existingPlayerMap.set(player.startgg_player_id, player.player_id);
                // Update stats like original method
                this.responseStats["playerIDs"].push(player.player_id);
            });
        }

        // Step 4: Handle player updates (profile image and country) if flags are set
        if (this.mustUpdatePlayerCountry || this.mustUpdatePlayerProfileImage) {
            const updatePromises = [];
            for (const [startggId, playerData] of playersMap) {
                const playerId = existingPlayerMap.get(startggId);
                if (playerId && existingPlayers.some(p => p.player_startgg_player_id === startggId)) {
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
            .createQueryBuilder()
            .select(['ptr.playerID', 'ptr.tournamentID'])
            .from(PlayerTournamentRun, 'ptr')  // Using PlayerTournamentRun entity instead of 'player_tournament_run'
            .where('ptr.playerID IN (:...playerIds)', { playerIds: Array.from(existingPlayerMap.values()) })
            .andWhere('ptr.tournamentID = :tournamentId', { tournamentId: tournamentID })
            .getRawMany();

        const existingPTRSet = new Set(
            existingPTRs.map(ptr => `${ptr.ptr_player_id}-${ptr.ptr_tournament_id}`)
        );

        // Step 6: Bulk create missing player tournament runs
        const newPTRData = [];
        for (const [startggId, playerData] of playersMap) {
            const playerId = existingPlayerMap.get(startggId);
            if (playerId) {
                const ptrKey = `${playerId}-${tournamentID}`;
                if (!existingPTRSet.has(ptrKey)) {
                    newPTRData.push({
                        playerID: playerId,
                        tournamentID: tournamentID,
                        playerEntryName: playerData.name,
                        placement: playerData.placement,
                        seed: playerData.seed,
                        charactersUsed: []
                    });

                    // Update stats like original method
                    this.responseStats["playerTournamentRunIDs"].push([playerId, tournamentID]);
                }
            }
        }

        if (newPTRData.length > 0) {
            await ptrRepo
                .createQueryBuilder()
                .insert()
                .values(newPTRData)
                .execute();
        }

        return existingPlayerMap; // Return startggId -> playerId mapping for use in createSets
    }

    private async createMatches(
        matches: StartGGTournamentMatchRecord[],
        setID: number,
    ) {
        if (matches.length > 0) {
            for (const match of matches) {
                const matchQuery: CreateTournamentMatchDTO = {
                    tournamentSetID: setID,
                    playerOneCharacter: match.player_one_character,
                    playerTwoCharacter: match.player_two_character,
                    winnerName: match.winner_name,
                    matchNumber: match.match_number,
                };
                const newMatch =
                    await this.tournamentMatchService.create(matchQuery);
                // Update stats
                this.responseStats["matchIDs"].push(newMatch.tournamentMatchID);
            }
        }
    }

    private async createSets(
        setsData: StartGGTournamentSetRecord[],
        tournamentID: number,
        playerIdMap: Map<number, number>,
    ) {
        for (const set of setsData) {
            // Check to make sure set doesn't already exist
            const setExistence =
                await this.tournamentSetService.findByStartGGSetId(set.set_id);
            if (setExistence)
                throw new BadRequestException(
                    `Set with startgg_set_id ${set.set_id} already exists.\nHas this tournament already been parsed?\nIs there a conflicting startgg_set_id?`,
                );

            const playerOneId = playerIdMap.get(set.player_one_startgg_id);
            const playerTwoId = playerIdMap.get(set.player_two_startgg_id);
            if (!playerOneId || !playerTwoId)
                throw new NotFoundException(
                    `Either player ${set.player_one_name} with startgg_player_id ${set.player_one_startgg_id} or ${set.player_two_name} with startgg_player_id ${set.player_two_startgg_id} does not exist`,
                );

            // Initialize payload
            const setQuery = {
                playerOneID: playerOneId,
                playerTwoID: playerTwoId,
                tournamentID: tournamentID,
                startggSetID: set.set_id,
                winnerName: set.winner_name,
                winnerID:
                    set.player_one_score > set.player_two_score
                        ? playerOneId
                        : playerTwoId,
            };

            // Add matchesToWin
            setQuery["matchesToWin"] = set.matches_to_win;
            // Add bracket name
            setQuery["bracketName"] = set.phase_name;
            // Add bracket round name
            setQuery["bracketRound"] = set.round_name;

            // Create sets
            const newSet = await this.tournamentSetService.create(setQuery);

            // Update player tournament run characters
            const playerOneCharacters = set.player_one_characters;
            let p1Res = null;
            if (
                playerOneCharacters !== null &&
                playerOneCharacters.length > 0
            ) {
                p1Res =
                    await this.playerTournamentRunService.updateCharactersUsed(
                        playerOneId,
                        tournamentID,
                        playerOneCharacters,
                    );
            }
            let p2Res = null;
            const playerTwoCharacters = set.player_two_characters;
            if (
                playerTwoCharacters !== null &&
                playerTwoCharacters.length > 0
            ) {
                p2Res =
                    await this.playerTournamentRunService.updateCharactersUsed(
                        playerTwoId,
                        tournamentID,
                        playerTwoCharacters,
                    );
            }

            // Update stats
            this.responseStats["setIDs"].push(newSet.tournamentSetID);

            // Create matches
            await this.createMatches(set.matches, newSet.tournamentSetID);
        }
    }
    //#endregion
}
