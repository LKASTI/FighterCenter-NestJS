import { Inject, Injectable, Logger } from "@nestjs/common";
import { FindLatestTournamentsQueryDto } from "../dtos/request/find-latest-tournaments-query.dto";
import { TournamentSeriesPlayerDto } from "../dtos/response/tournament-series-player.response.dto";
import { TournamentSeriesRepository } from "../repositories/tournament-series.repository";
import { TaggedCacheService } from "@common/cache/tagged-cache.service";
import { CacheKeys, CacheTags } from "@common/cache/cache-keys.util";
import { hashQuery } from "@common/cache/query-hash.util";
import { Tournament } from "@domain/entities";
import { TournamentService } from "@domain/tournament";

@Injectable()
export class TournamentSeriesService {
    private readonly logger = new Logger(TournamentSeriesService.name);

    constructor(
        @Inject()
        private readonly tournamentSeriesRepository: TournamentSeriesRepository,
        private readonly tournamentService: TournamentService,
        private readonly taggedCacheService: TaggedCacheService
    ) {}

    public async findPlayersByTournamentId(
        id: number,
    ): Promise<TournamentSeriesPlayerDto[]> {
        const cacheKey = CacheKeys.tournamentSeries.playersByTournamentId(id);
        const cached = await this.taggedCacheService.get<TournamentSeriesPlayerDto[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.tournamentSeriesRepository.findPlayersByTournamentId(
            id,
        );

        // Cache for 30 minutes (30 * 60 * 1000 = 1800000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [CacheTags.tournament.byId(id)],
            1800000,
        );

        return result;
    }

    public async findTopXPlayersByTournamentIds(
        x: number,
        tournamentIDs: number[],
    ): Promise<TournamentSeriesPlayerDto[]> {
        const queryHash = hashQuery({ x, tournamentIDs: tournamentIDs.sort() });
        const cacheKey = CacheKeys.tournamentSeries.topPlayersByTournamentIds(queryHash);
        const cached = await this.taggedCacheService.get<TournamentSeriesPlayerDto[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.tournamentSeriesRepository.findTopXPlayersByTournamentIds(
            x,
            tournamentIDs,
        );

        // Cache for 30 minutes (30 * 60 * 1000 = 1800000ms)
        // Tag with all tournament IDs so invalidation of any tournament clears this
        const tags = tournamentIDs.map(id => CacheTags.tournament.byId(id));
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            tags,
            1800000,
        );

        return result;
    }

    public async findLatestTournaments(query: FindLatestTournamentsQueryDto) {
        const { eventSeriesIds = [] } = query;
        // Cache this query
        const queryHash = hashQuery({ eventSeriesIds: eventSeriesIds.sort() });
        const cacheKey = CacheKeys.tournamentSeries.latestByEventIds(queryHash);
        const cached = await this.taggedCacheService.get<{ data: Tournament[] }>(cacheKey);

        if (cached) {
            return cached;
        }

        const tournaments: Tournament [] = [];
        if( eventSeriesIds.length > 0) {
            for(let i = 0; i < eventSeriesIds.length; i++) {
                const eventSeriesId = parseInt(eventSeriesIds[i]);
                try {
                    const res = await this.tournamentService.findAll({
                        eventID: eventSeriesId,
                        order: "DESC",
                        sortBy: "dates",
                        limit: 1
                    })
                    if (res.data && res.data.length > 0) {
                        tournaments.push(res.data[0]);
                    }
                } catch (error) {
                    this.logger.error(`Error fetching tournaments for event series ID ${eventSeriesId}:`, error);
                    return {
                        data: []
                    }
                }
            }
        }

        const result = { data: tournaments };

        // Cache for 15 minutes (15 * 60 * 1000 = 900000ms)
        // Tag with all event IDs so invalidation of any event's tournaments clears this
        const tags = eventSeriesIds.map(id => CacheTags.tournament.event(parseInt(id)));
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            tags,
            900000,
        );

        return result;
    }
}
