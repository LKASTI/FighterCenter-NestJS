import { Injectable } from "@nestjs/common";
import { PlayerSeriesPerformanceAgg } from "../entities/PlayerSeriesPerformanceAgg.entity";
import { PlayerSeriesPerformanceAggRepository } from "./playerSeriesPerformanceAgg.repository";
import { EventService } from "../event/event.service";
import { TournamentSetRepository } from "../tournamentSet/tournamentSet.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { TournamentMatchRepository } from "../tournamentMatch/tournamentMatch.repository";
import { TaggedCacheService } from "../../common/cache/tagged-cache.service";
import { CacheKeys, CacheTags } from "../../common/cache/cache-keys.util";

interface RawMatch {
    setId: number;
    winner: string;
    wins: string;
}

interface RawSet {
    tournamentId: number;
    tournament: string;
    tournamentSetId: number;
    bracketName: string;
    bracketRound: string;
    winnerName: string;
    winnerId: number;
    playerOneId: number;
    playerTwoId: number;
    matchesToWin: number;
    playerOneName: string;
    playerTwoName: string;
    vodLink: string;
}

@Injectable()
export class PlayerSeriesPerformanceAggService {
    constructor(
        private readonly repository: PlayerSeriesPerformanceAggRepository,
        private readonly eventService: EventService,
        @InjectRepository(TournamentSetRepository)
        private readonly tournamentSetRepository: TournamentSetRepository,
        @InjectRepository(TournamentMatchRepository)
        private readonly tournamentMatchRepository: TournamentMatchRepository,
        private readonly taggedCacheService: TaggedCacheService,
    ) {}

    async getPlayerSetsForSeries(playerId: number, eventId: number): Promise<any[]> {
        const cacheKey = CacheKeys.playerSeriesPerformance.playerSets(eventId, playerId);
        const cached = await this.taggedCacheService.get<any[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const rawResults: RawSet[] = await this.tournamentSetRepository
            .createQueryBuilder('tournamentSet')
            .leftJoin('tournamentSet.tournament', 'tournament')
            .leftJoin('tournamentSet.playerOne', 'playerOneRun')
            .leftJoin('playerOneRun.player', 'playerOnePlayer')
            .leftJoin('tournamentSet.playerTwo', 'playerTwoRun')
            .leftJoin('playerTwoRun.player', 'playerTwoPlayer')
            .select([
                'tournament.tournament_id as "tournamentId"',
                'tournamentSet.tournamentSetID as "tournamentSetId"',
                'tournamentSet.bracketName as "bracketName"',
                'tournamentSet.bracketRound as "bracketRound"',
                'tournamentSet.winnerName as "winnerName"',
                'tournamentSet.winnerID as "winnerId"',
                'tournamentSet.playerOneID as "playerOneId"',
                'tournamentSet.playerTwoID as "playerTwoId"',
                'tournamentSet.matchesToWin as "matchesToWin"',
                'playerOnePlayer.playerName as "playerOneName"',
                'playerTwoPlayer.playerName as "playerTwoName"',
                'tournament.vodLink as "vodLink"'
            ])
            // **Fixed: Use matchesToWin or calculate from separate query**
            .where('tournament.eventID = :eventId', { eventId })
            .andWhere(
                '(tournamentSet.playerOneID = :playerId OR tournamentSet.playerTwoID = :playerId)',
                { playerId }
            )
            .orderBy('tournament.dates', 'DESC')
            .getRawMany();

        // **Get match counts separately to avoid subquery issues**
        const setIds = rawResults.map(r => r.tournamentSetId as number);

        const matches: RawMatch[] = await this.tournamentMatchRepository
            .createQueryBuilder('match')
            .select([
                'match.tournamentSetID as "setId"',
                'match.winnerName as "winner"',
                'COUNT(*) as "wins"'
            ])
            .where('match.tournamentSetID IN (:...setIds)', { setIds })
            .groupBy('match.tournamentSetID, match.winnerName')
            .getRawMany();

        const setIdToMatchesMap = new Map<number, RawMatch[]>();
        matches.forEach(match => {
            if(!setIdToMatchesMap.has(match.setId)) {
                setIdToMatchesMap.set(match.setId, []);
            }
            setIdToMatchesMap.get(match.setId).push(match);
        });

        // Combine results with match data
        const result = rawResults.map(result => {
            const setMatches = setIdToMatchesMap.get(result.tournamentSetId) || [];
            const playerOneWins = parseInt(setMatches.find(m => m.winner === result.playerOneName)?.wins) || 0;
            const playerTwoWins = parseInt(setMatches.find(m => m.winner === result.playerTwoName)?.wins) || 0;

            const isPlayerOneWinner = result.winnerId === result.playerOneId;

            let score = "N/A";
            if(playerOneWins + playerTwoWins > 0) {
                score = `${Math.max(playerOneWins, playerTwoWins)}-${Math.min(playerOneWins, playerTwoWins)}`;
            }

            return {
                ...result,
                winnerScore: isPlayerOneWinner ? playerOneWins : playerTwoWins,
                loserScore: isPlayerOneWinner ? playerTwoWins : playerOneWins,
                loserName: isPlayerOneWinner ? result.playerTwoName : result.playerOneName,
                loserID: isPlayerOneWinner ? result.playerTwoId : result.playerOneId,
                score: score,
            };
        });

        // Cache for 30 minutes (30 * 60 * 1000 = 1800000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [
                CacheTags.tournament.event(eventId),
                CacheTags.player.byId(playerId),
                CacheTags.playerSeriesPerformance.player(eventId, playerId),
            ],
            1800000,
        );

        return result;
    }

    public async getAllForSeries(eventSeriesID: number): Promise<PlayerSeriesPerformanceAgg[]> {
        const cacheKey = CacheKeys.playerSeriesPerformance.allForSeries(eventSeriesID);
        const cached = await this.taggedCacheService.get<PlayerSeriesPerformanceAgg[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.repository.find({
            where: { eventID: eventSeriesID },
            order: {
                bestPlacement: 'ASC',
                bestPlacementCount: 'DESC',
                attendance: 'DESC'
            }
        });

        // Cache for 1 hour (60 * 60 * 1000 = 3600000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [
                CacheTags.tournament.event(eventSeriesID),
                CacheTags.playerSeriesPerformance.event(eventSeriesID),
            ],
            3600000,
        );

        return result;
    }

    public async getAllForSeriesTable(eventSeriesID: number): Promise<Partial<PlayerSeriesPerformanceAgg>[]> {
        return await this.repository.find({
            where: { eventID: eventSeriesID },
            select: ['playerID', 'playerName', 'country', 'attendance', 'placementToCount', 'charactersUsed']
        });
    }

    public async getPlayerPerformanceData(playerID: number, eventSeriesID: number): Promise<PlayerSeriesPerformanceAgg> {
        const cacheKey = CacheKeys.playerSeriesPerformance.performanceData(eventSeriesID, playerID);
        const cached = await this.taggedCacheService.get<PlayerSeriesPerformanceAgg>(cacheKey);

        if (cached) {
            return cached;
        }

        let currentAggData = await this.repository.findOneBy({
            playerID,
            eventID: eventSeriesID
        });

        if(!currentAggData || await this.aggregateNeedsUpdate(playerID, eventSeriesID, currentAggData)) {
            await this.repository.calculateAndSavePlayerPerformanceAgg(playerID, eventSeriesID);
            currentAggData = await this.repository.findOneBy({
                playerID,
                eventID: eventSeriesID
            });
        }

        // Cache for 1 hour (60 * 60 * 1000 = 3600000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            currentAggData,
            [
                CacheTags.tournament.event(eventSeriesID),
                CacheTags.player.byId(playerID),
                CacheTags.playerSeriesPerformance.player(eventSeriesID, playerID),
            ],
            3600000,
        );

        return currentAggData;
    }

    public async updateAllForSeries(eventSeriesID: number, playerIDs?: number[]): Promise<boolean> {
        if(!playerIDs) playerIDs = await this.repository.getAllPlayerIdsInSeries(eventSeriesID);

        await this.processBatch(eventSeriesID, playerIDs, { chunkSize: 50, delayMs: 200 });

        // Invalidate all performance caches for this event series
        await this.taggedCacheService.invalidateByTag(
            CacheTags.playerSeriesPerformance.event(eventSeriesID)
        );


        return true;
    }

    private async processBatch(
        eventSeriesID: number,
        playerIDs: number[],
        config: { chunkSize: number, delayMs: number }
    ): Promise<void> {
        const { chunkSize, delayMs } = config;
        for(let i = 0; i < playerIDs.length; i += chunkSize) {
            const chunk = playerIDs.slice(i, i + chunkSize);

            await Promise.all(chunk.map(playerId =>
                this.repository.calculateAndSavePlayerPerformanceAgg(playerId, eventSeriesID)
            ))

            if(i + chunkSize < playerIDs.length) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }

            const processed = Math.min(i + chunkSize, playerIDs.length);
            console.log(`PlayerPeformance Batch progress: ${processed}/${playerIDs.length} players`);
        }
    }

    /**
     * Update player performance data for a specific event series if needed
     * @param playerID
     * @param eventSeriesID
     * @throws {Error} If the event series is not found
     */
    public async updatePlayerPerformanceData(playerID: number, eventSeriesID: number): Promise<boolean> {
        try {
            const shouldUpdate = await this.aggregateNeedsUpdate(playerID, eventSeriesID);
            if(!shouldUpdate) return false;

            await this.repository.calculateAndSavePlayerPerformanceAgg(playerID, eventSeriesID);

            // Invalidate performance caches for this player
            await this.taggedCacheService.invalidateByTag(
                CacheTags.playerSeriesPerformance.player(eventSeriesID, playerID)
            );

            return true;
        } catch(error) {
            console.error(`Failed to update player performance data for playerId: ${playerID} and eventId: ${eventSeriesID}:`, error);
            throw error;
        }
    }

    private async aggregateNeedsUpdate(
        playerID: number, eventSeriesID: number,
        currentAggData?: PlayerSeriesPerformanceAgg | undefined
    ): Promise<boolean> {
        // Get tournament series
        const series = await this.eventService.findById(eventSeriesID);
        if(!series) throw new Error(`Event series with ID ${eventSeriesID} not found`);

        // Check if last time agg data was updated is older than last updated tournament for the series
        if(!currentAggData) currentAggData = await this.repository.findOneBy({
            playerID,
            eventID: eventSeriesID
        });
        if(!currentAggData) return true; // No agg data found, needs to be created
        if(currentAggData.updatedAt > series.lastUpdatedTournamentDate) return false;

        // Check if there are any new tournaments or removed tournaments
        const currentAggTournamentsIds = currentAggData?.tournaments.map(t => t.tournamentId) || [];
        const currentAggTournamentsIdsSet = new Set(currentAggTournamentsIds);

        const tournamentsCompetedInIds = await this.repository
            .getTournamentsCompetedInIds(playerID, eventSeriesID);
        const tournamentsCompetedInIdsSet = new Set(tournamentsCompetedInIds);

        const newTournaments = tournamentsCompetedInIds.filter(id => !currentAggTournamentsIdsSet.has(id));
        const removedTournaments = currentAggTournamentsIds.filter(id => !tournamentsCompetedInIdsSet.has(id));

        // Exit if no new/removed tournaments found
        return !(newTournaments.length === 0 && removedTournaments.length === 0);
    }
}