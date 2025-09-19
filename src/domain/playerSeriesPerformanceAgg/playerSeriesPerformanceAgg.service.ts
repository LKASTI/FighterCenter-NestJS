import { Injectable } from "@nestjs/common";
import { PlayerSeriesPerformanceAgg } from "../entities/PlayerSeriesPerformanceAgg.entity";
import { PlayerSeriesPerformanceAggRepository } from "./playerSeriesPerformanceAgg.repository";
import { EventService } from "../event/event.service";

@Injectable()
export class PlayerSeriesPerformanceAggService {
    constructor(
        private readonly repository: PlayerSeriesPerformanceAggRepository,
        private readonly eventService: EventService
    ) {}

    public async getAllForSeries(eventSeriesID: number): Promise<PlayerSeriesPerformanceAgg[]> {
        return await this.repository.findBy({
            eventID: eventSeriesID
        });
    }

    public async getPlayerPerformanceData(playerID: number, eventSeriesID: number): Promise<PlayerSeriesPerformanceAgg> {
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

        return currentAggData;
    }

    public async updateAllForSeries(eventSeriesID: number, playerIDs?: number[]): Promise<boolean> {
        if(!playerIDs) playerIDs = await this.repository.getAllPlayerIdsInSeries(eventSeriesID);

        await this.processBatch(eventSeriesID, playerIDs, { chunkSize: 50, delayMs: 200 });

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