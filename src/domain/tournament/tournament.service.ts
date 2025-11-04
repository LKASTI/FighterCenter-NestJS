import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { TournamentRepository } from "src/domain/tournament/tournament.repository";
import {
    CreateTournamentDTO,
    FindTournamentsQueryDTO,
    UpdateTournamentDTO,
} from "src/dtos/tournament.dto";
import { Tournament } from "src/domain/entities/tournament.entity";
import { TaggedCacheService } from "../../common/cache/tagged-cache.service";
import { CacheKeys, CacheTags } from "../../common/cache/cache-keys.util";
import { hashQuery } from "../../common/cache/query-hash.util";

@Injectable()
export class TournamentService {
    constructor(
        @InjectRepository(TournamentRepository)
        private readonly tournamentRepository: TournamentRepository,
        private readonly taggedCacheService: TaggedCacheService,
    ) {}

    public async create(
        createTournamentDTO: CreateTournamentDTO,
    ): Promise<Tournament> {
        return await this.tournamentRepository.createAndSave(
            createTournamentDTO,
        );
    }

    public async findAll(query: FindTournamentsQueryDTO) {
        const queryHash = hashQuery(query);
        const cacheKey = CacheKeys.tournament.list(queryHash);
        const cached = await this.taggedCacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.tournamentRepository.findAll(query);

        // Cache for 10 minutes (10 * 60 * 1000 = 600000ms)
        const tags = [CacheTags.tournament.allLists()];

        // If querying by eventID, tag with that event too
        if (query.eventID) {
            tags.push(CacheTags.tournament.event(query.eventID));
        }

        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            tags,
            600000,
        );

        return result;
    }

    public async findById(id: number): Promise<Tournament> {
        const cacheKey = CacheKeys.tournament.byId(id);
        const cached = await this.taggedCacheService.get<Tournament>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.tournamentRepository.findOneBy({ tournamentID: id });

        if (result) {
            // Cache for 15 minutes (15 * 60 * 1000 = 900000ms)
            await this.taggedCacheService.setWithTags(
                cacheKey,
                result,
                [
                    CacheTags.tournament.byId(id),
                    CacheTags.tournament.event(result.eventID),
                ],
                900000,
            );
        }

        return result;
    }

    public async findAllGamePatchesByEventId(eventID: number) {
        const cacheKey = CacheKeys.tournament.gamePatches(eventID);
        const cached = await this.taggedCacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.tournamentRepository.findAllGamePatchesByEventId(
            eventID,
        );

        // Cache for 2 hours (2 * 60 * 60 * 1000 = 7200000ms) - patches rarely change
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [CacheTags.tournament.event(eventID)],
            7200000,
        );

        return result;
    }

    public async update(
        id: number,
        updateTournamentDTO: UpdateTournamentDTO,
    ): Promise<Tournament> {
        const tournament = await this.tournamentRepository.findOneBy({
            tournamentID: id,
        });

        if (!tournament) {
            return null;
        }

        await this.tournamentRepository.update(
            { tournamentID: id },
            updateTournamentDTO,
        );
        return await this.tournamentRepository.findOneBy({ tournamentID: id });
    }

    public async remove(id: number): Promise<boolean> {
        const result = await this.tournamentRepository.delete({
            tournamentID: id,
        });
        return result.affected > 0;
    }
}
