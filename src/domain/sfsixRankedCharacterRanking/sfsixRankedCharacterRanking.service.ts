import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    CreateSFSixRankedCharacterRankingDTO,
    FindSFSixRankedCharacterRankingsQueryDTO,
    UpdateSFSixRankedCharacterRankingDTO,
} from "src/dtos/sfsixRankedCharacterRanking.dto";
import { SFSixRankedCharacterRanking } from "src/domain/entities/sfsixRankedCharacterRanking.entity";
import { SFSixRankedCharacterRankingRepository } from "src/domain/sfsixRankedCharacterRanking/sfsixRankedCharacterRanking.repository";
import { TaggedCacheService } from "src/common/cache/tagged-cache.service";
import { CacheKeys, CacheTags } from "src/common/cache/cache-keys.util";
import { hashQuery } from "src/common/cache/query-hash.util";

@Injectable()
export class SFSixRankedCharacterRankingService {
    constructor(
        @InjectRepository(SFSixRankedCharacterRankingRepository)
        private readonly repository: SFSixRankedCharacterRankingRepository,
        private readonly taggedCacheService: TaggedCacheService,
    ) {}

    public async create(
        sfsixRankedCharacterRankingDTO: CreateSFSixRankedCharacterRankingDTO,
    ): Promise<SFSixRankedCharacterRanking> {
        return await this.repository.createAndSave(
            sfsixRankedCharacterRankingDTO,
        );
    }

    public async findAll(query: FindSFSixRankedCharacterRankingsQueryDTO) {
        const cacheKey = CacheKeys.ranked.allRankings(hashQuery(query));
        const cached = await this.taggedCacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.repository.findAll(query);

        // Cache for 6 hours (6 * 60 * 60 * 1000 = 21600000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [CacheTags.ranked.allRankedData()],
            21600000,
        );

        return result;
    }

    public async findAllPhases() {
        const cacheKey = CacheKeys.ranked.allPhases();
        const cached = await this.taggedCacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.repository.findAllPhases();

        // Cache for 12 hours (12 * 60 * 60 * 1000 = 43200000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [CacheTags.ranked.allRankedData()],
            43200000,
        );

        return result;
    }

    public async findAllWeeklyDatesByPhase(phase: number) {
        const cacheKey = CacheKeys.ranked.weeklyDatesByPhase(phase);
        const cached = await this.taggedCacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.repository.findAllWeeklyDatesByPhase(phase);

        // Cache for 12 hours (12 * 60 * 60 * 1000 = 43200000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [CacheTags.ranked.phase(phase), CacheTags.ranked.allRankedData()],
            43200000,
        );

        return result;
    }

    public async findAllRankedPlayerAndCharacterInfoByDateAndPhase(
        query: FindSFSixRankedCharacterRankingsQueryDTO,
    ) {
        const dateString = query.date.toISOString();
        const cacheKey = CacheKeys.ranked.rankingsByDatePhase(dateString, query.phase);
        const cached = await this.taggedCacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.repository.findAllRankedPlayerAndCharacterInfoByDateAndPhase(
            query,
        );

        // Cache for 24 hours (24 * 60 * 60 * 1000 = 86400000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [
                CacheTags.ranked.date(dateString),
                CacheTags.ranked.phase(query.phase),
                CacheTags.ranked.allRankedData(),
            ],
            86400000,
        );

        return result;
    }

    public async findAllDistinctDatePhaseSeason() {
        const cacheKey = CacheKeys.ranked.distinctDatePhaseSeason();
        const cached = await this.taggedCacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.repository.findAllDistinctDatePhaseSeason();

        // Cache for 12 hours (12 * 60 * 60 * 1000 = 43200000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [CacheTags.ranked.allRankedData()],
            43200000,
        );

        return result;
    }

    public async findById(id: number): Promise<SFSixRankedCharacterRanking> {
        const cacheKey = CacheKeys.ranked.byId(id);
        const cached = await this.taggedCacheService.get<SFSixRankedCharacterRanking>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.repository.findOneBy({
            sfsixRankedCharacterRankingID: id,
        });

        if (result) {
            // Cache for 12 hours (12 * 60 * 60 * 1000 = 43200000ms)
            await this.taggedCacheService.setWithTags(
                cacheKey,
                result,
                [CacheTags.ranked.allRankedData()],
                43200000,
            );
        }

        return result;
    }

    public async findOneBy(
        query: FindSFSixRankedCharacterRankingsQueryDTO,
    ): Promise<SFSixRankedCharacterRanking> {
        return await this.repository.findOneBy(query);
    }

    public async update(
        id: number,
        updateSFSixRankedCharacterRankingDTO: UpdateSFSixRankedCharacterRankingDTO,
    ): Promise<SFSixRankedCharacterRanking> {
        const rankedCharacter = await this.repository.findOneBy({
            sfsixRankedCharacterRankingID: id,
        });

        if (!rankedCharacter) {
            return null;
        }

        await this.repository.update(
            { sfsixRankedCharacterRankingID: id },
            updateSFSixRankedCharacterRankingDTO,
        );
        return await this.repository.findOneBy({
            sfsixRankedCharacterRankingID: id,
        });
    }

    public async remove(id: number): Promise<boolean> {
        const result = await this.repository.delete({
            sfsixRankedCharacterRankingID: id,
        });
        return result.affected > 0;
    }
}
