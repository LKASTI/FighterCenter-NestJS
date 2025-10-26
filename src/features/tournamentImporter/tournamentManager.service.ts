import { Injectable, NotFoundException } from "@nestjs/common";
import { TournamentManagerRepository } from "./tournamentManager.repository";
import { TournamentService } from "../../domain/tournament/tournament.service";
import { FindTournamentsQueryDTO, UpdateTournamentDTO } from "../../dtos/tournament.dto";
import { UpdateSeriesTournamentDTO } from "./tournamentManager.dto";
import { SFSixGamePatchService } from "../../domain/sfsixGamePatch/sfsixGamePatch.service";
import { FindSFSixGamePatchDTO } from "../../dtos/sfsixGamePatch.dto";
import { toWords } from "number-to-words";
import { Tournament } from "../../domain/entities";
import { PlayerSeriesPerformanceAggService } from "../../domain/playerSeriesPerformanceAgg/playerSeriesPerformanceAgg.service";
import { InjectRepository } from "@nestjs/typeorm";
import { PlayerTournamentRunRepository } from "../../domain/playerTournamentRun/playerTournamentRun.repository";
import { EventRepository } from "../../domain/event/event.repository";

@Injectable()
export class TournamentManagerService {
    constructor(
        private readonly tournamentManagerRepository: TournamentManagerRepository,
        private readonly tournamentService: TournamentService,
        private readonly gamePatchService: SFSixGamePatchService,
        private readonly playerSeriesPerformanceAggService: PlayerSeriesPerformanceAggService,
        @InjectRepository(PlayerTournamentRunRepository)
        private readonly playerTournamentRunRepository: PlayerTournamentRunRepository,
        @InjectRepository(EventRepository)
        private readonly eventRepository: EventRepository,
    ) {}

    public async deleteTournamentData(tournamentSeriesId: number, tournamentId: number, updatedBy?: string) {
        // check if tournament exists for series
        const exists = await this.tournamentExistsForSeries(tournamentId, tournamentSeriesId);
        if(!exists) {
            throw new NotFoundException("Tournament not found for the given series");
        }

        console.log(`🗑️  Deleting tournament ${tournamentId} from series ${tournamentSeriesId}`);

        // 1. Get affected player IDs BEFORE deletion
        const affectedPlayerIds = await this.playerTournamentRunRepository
            .find({
                where: { tournamentID: tournamentId },
                select: ['playerID']
            })
            .then(ptrs => ptrs.map(ptr => ptr.playerID));

        console.log(`📊 Found ${affectedPlayerIds.length} affected players: [${affectedPlayerIds.join(', ')}]`);

        // 2. Delete tournament data (matches, sets, PTRs, tournament)
        const result = await this.tournamentManagerRepository.deleteTournamentData(tournamentId);

        // 3. Update event's lastUpdatedTournamentDate to invalidate caches
        await this.eventRepository.update(
            { eventID: tournamentSeriesId },
            {
                lastUpdatedTournamentDate: new Date(),
                updatedBy: updatedBy || null
            }
        );

        console.log(`✅ Tournament deleted, event ${tournamentSeriesId} lastUpdatedTournamentDate updated`);

        // 4. Trigger aggregate recalculation for affected players
        // Run in background to avoid blocking the response
        if (affectedPlayerIds.length > 0) {
            setImmediate(async () => {
                try {
                    console.log(`🔄 Starting background update of performance aggregates for ${affectedPlayerIds.length} players`);
                    await this.playerSeriesPerformanceAggService.updateAllForSeries(
                        tournamentSeriesId,
                        affectedPlayerIds
                    );
                    console.log(`✅ Successfully updated performance aggregates for ${affectedPlayerIds.length} players after tournament deletion`);
                } catch (error) {
                    console.error('❌ Error updating player performance aggs after deletion:', error);
                }
            });
        } else {
            console.log(`⚠️  No players affected by tournament deletion, skipping aggregate updates`);
        }

        return result;
    }

    public async updateTournamentData(tournamentId: number, tournamentSeriesId: number, request: UpdateSeriesTournamentDTO): Promise<Tournament> {
        // check if tournament exists for series
        const exists = await this.tournamentExistsForSeries(tournamentId, tournamentSeriesId);
        if(!exists) {
            throw new NotFoundException("Tournament not found for the given series");
        }
        const mappedRequest: UpdateTournamentDTO = {
            tournamentName: request.tournamentName,
            tournamentRegion: request.tournamentRegion,
            gamePatch: request.gamePatch,
            gameSeason: request.gameSeason,
            vodLink: request.vodLink,
            tournamentType: request.tournamentType,
            isOnline: request.isOnline,
            top8GraphicIsFile: request.top8GraphicIsFile,
            tournamentTop8GraphicImage: request.tournamentTop8GraphicImage,
        }
        // validate patch and season
        const patchObjects = await this.gamePatchService.findAll(new FindSFSixGamePatchDTO());
        const patches = patchObjects.data.map(p => p.patch.toLowerCase());
        const seasons = patchObjects.data.map(p => toWords(p.patchSeason).toLowerCase());
        if(request.gamePatch && !patches.includes(request.gamePatch.toLowerCase())) {
            throw new NotFoundException(`Game patch ${request.gamePatch} is invalid`);
        }
        if(request.gameSeason && !seasons.includes(request.gameSeason.toLowerCase())) {
            throw new NotFoundException(`Game season ${request.gameSeason} is invalid`);
        }

        return await this.tournamentService.update(tournamentId, mappedRequest);

    }

    private async tournamentExistsForSeries(tournamentId: number, tournamentSeriesId: number): Promise<boolean> {
        const tournamentQuery = new FindTournamentsQueryDTO();
        tournamentQuery.eventID = tournamentSeriesId;
        tournamentQuery.tournamentID = tournamentId;
        const res = await this.tournamentService.findAll(tournamentQuery);
        if(!res.data || (res.data && res.data.length === 0)) {
            console.log("Tournament not found for the given series");
            return false;
        }
        return true;
    }
}