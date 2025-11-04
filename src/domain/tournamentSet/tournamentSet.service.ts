import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    CreateTournamentSetDTO,
    FindTournamentSetsQueryDTO,
    UpdateTournamentSetDTO,
} from "src/dtos/tournamentSet.dto";
import { TournamentSetRepository } from "src/domain/tournamentSet/tournamentSet.repository";

import { TaggedCacheService } from "../../common/cache/tagged-cache.service";
import { CacheKeys, CacheTags } from "../../common/cache/cache-keys.util";
import { hashQuery } from "../../common/cache/query-hash.util";

@Injectable()
export class TournamentSetService {
    constructor(
        @InjectRepository(TournamentSetRepository)
        private readonly tournamentSetRepository: TournamentSetRepository,
        private readonly taggedCacheService: TaggedCacheService,
    ) {}

    public async create(createTournamentSetDTO: CreateTournamentSetDTO) {
        return await this.tournamentSetRepository.createAndSave(
            createTournamentSetDTO,
        );
    }

    public async findAll(query: FindTournamentSetsQueryDTO) {
        const queryHash = hashQuery(query);
        const cacheKey = CacheKeys.tournamentSet.list(queryHash);
        const cached = await this.taggedCacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.tournamentSetRepository.findAll(query);

        // Cache for 10 minutes (10 * 60 * 1000 = 600000ms)
        const tags = [];

        // If querying by tournamentID, tag with that tournament
        if (query.tournamentID) {
            tags.push(CacheTags.tournament.byId(query.tournamentID));
            tags.push(CacheTags.tournamentSet.tournament(query.tournamentID));
        }

        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            tags.length > 0 ? tags : ['tournament-sets-all'],
            600000,
        );

        return result;
    }

    public async findById(id: number) {
        return await this.tournamentSetRepository.findOneBy({
            tournamentSetID: id,
        });
    }

    public async findByStartGGSetId(id: number) {
        return await this.tournamentSetRepository.findOneBy({
            startggSetID: id,
        });
    }

    public async findAllByTournamentID(tournamentID: number) {
        const cacheKey = CacheKeys.tournamentSet.byTournamentId(tournamentID);
        const cached = await this.taggedCacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.tournamentSetRepository.findAllByTournamentID(
            tournamentID,
        );

        // Cache for 15 minutes (15 * 60 * 1000 = 900000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [
                CacheTags.tournament.byId(tournamentID),
                CacheTags.tournamentSet.tournament(tournamentID),
            ],
            900000,
        );

        return result;
    }

    public async update(
        id: number,
        updateTournamentSetDTO: UpdateTournamentSetDTO,
    ) {
        const tournamentSet = await this.tournamentSetRepository.findOneBy({
            tournamentSetID: id,
        });

        if (!tournamentSet) {
            return null;
        }

        await this.tournamentSetRepository.update(
            { tournamentSetID: id },
            updateTournamentSetDTO,
        );
        return await this.tournamentSetRepository.findOneBy({
            tournamentSetID: id,
        });
    }

    public async remove(id: number) {
        const result = await this.tournamentSetRepository.delete({
            tournamentSetID: id,
        });
        return result.affected > 0;
    }
}
