import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Tournament } from "@domain/entities/tournament.entity";
import { TournamentRepository } from "../repositories/tournament.repository";
import { CreateTournamentDto } from "../dtos/request/create-tournament.dto";
import { UpdateTournamentDto } from "../dtos/request/update-tournament.dto";
import { FindTournamentsQueryDto } from "../dtos/request/find-tournaments-query.dto";
import { TaggedCacheService, hashQuery } from "@fgclegends/fightercenter-shared-nestjs";
import { CacheKeys, CacheTags } from "@common/cache/cache-keys.util";

@Injectable()
export class TournamentService {
    constructor(
        @InjectRepository(TournamentRepository)
        private readonly tournamentRepository: TournamentRepository,
        private readonly taggedCacheService: TaggedCacheService,
    ) {}

    public async create(
        createTournamentDto: CreateTournamentDto,
    ): Promise<Tournament> {
        return await this.tournamentRepository.createAndSave(
            createTournamentDto,
        );
    }

    public async findAll(query: FindTournamentsQueryDto) {
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
        updateTournamentDto: UpdateTournamentDto,
    ): Promise<Tournament> {
        const tournament = await this.tournamentRepository.findOneBy({
            tournamentID: id,
        });

        if (!tournament) {
            return null;
        }

        await this.tournamentRepository.update(
            { tournamentID: id },
            updateTournamentDto,
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
