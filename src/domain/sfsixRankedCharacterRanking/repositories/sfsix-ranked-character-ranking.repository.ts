import { InjectRepository } from "@nestjs/typeorm";
import { SFSixRankedCharacterRanking } from "@entities/sfsixRankedCharacterRanking.entity";
import { Repository } from "typeorm";
import {
    CreateSfsixRankedCharacterRankingDto,
    FindSfsixRankedCharacterRankingsQueryDto,
} from "../dtos/request";
import { SFSixRankedCharacter } from "@entities/sfsixRankedCharacter.entity";
import { NotFoundException } from "@nestjs/common/exceptions/not-found.exception";

export class SfsixRankedCharacterRankingRepository extends Repository<SFSixRankedCharacterRanking> {
    constructor(
        @InjectRepository(SFSixRankedCharacterRanking)
        private repository: Repository<SFSixRankedCharacterRanking>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    /**
     * Create and save a new SFSixRankedCharacterRanking
     * @param sfsfixRankedCharacterDTO - DTO for creating a new SFSixRankedCharacterRanking
     * @returns The newly created SFSixRankedCharacterRanking
     * DTO must contain sfsixRankedCharacterID to link to SFSixRankedCharacter
     */
    public async createAndSave(
        sfsfixRankedCharacterDTO: CreateSfsixRankedCharacterRankingDto,
    ): Promise<SFSixRankedCharacterRanking> {
        // Retrieve rankedCharacter if sfsixRankedCharacterID provided
        const sfsixRankedCharacter = await this.manager
            .getRepository(SFSixRankedCharacter)
            .findOneBy({
                sfsixRankedCharacterID:
                    sfsfixRankedCharacterDTO.sfsixRankedCharacterID,
            });

        if (!sfsixRankedCharacter)
            throw new NotFoundException(
                `SFSixRankedCharacter with ID ${sfsfixRankedCharacterDTO.sfsixRankedCharacterID} not found`,
            );

        const rankedCharacterRanking = this.create({
            sfsixRankedCharacter: sfsixRankedCharacter,
            league: sfsfixRankedCharacterDTO.league,
            phase: sfsfixRankedCharacterDTO.phase,
            season: sfsfixRankedCharacterDTO.season,
            masterRating: sfsfixRankedCharacterDTO.masterRating,
            rank: sfsfixRankedCharacterDTO.rank,
            date: sfsfixRankedCharacterDTO.date,
        });

        // Save and return the new rankedCharacter
        return await this.save(rankedCharacterRanking);
    }

    public async findAll(query: FindSfsixRankedCharacterRankingsQueryDto) {
        const queryBuilder = this.createQueryBuilder("rankedCharacterRanking");

        // Apply filters if provided
        // !! Exact comparison wtih =  !!
        if (query.league) {
            queryBuilder.andWhere("rankedCharacterRanking.league = :league", {
                league: query.league,
            });
        }

        if (query.phase) {
            queryBuilder.andWhere("rankedCharacterRanking.phase = :phase", {
                phase: query.phase,
            });
        }

        if (query.season) {
            queryBuilder.andWhere("rankedCharacterRanking.season = :season", {
                season: query.season,
            });
        }

        if (query.masterRating) {
            queryBuilder.andWhere(
                "rankedCharacterRanking.masterRating = :masterRating",
                {
                    masterRating: query.masterRating,
                },
            );
        }

        if (query.rank) {
            queryBuilder.andWhere("rankedCharacterRanking.rank = :rank", {
                rank: query.rank,
            });
        }

        if (query.date) {
            queryBuilder.andWhere("rankedCharacterRanking.date = :date", {
                date: query.date.toISOString(),
            });
        }

        // Add sorting
        if (query.sortBy) {
            queryBuilder.orderBy(
                `rankedCharacterRanking.${query.sortBy}`,
                query.order,
            );
        }

        // Add limit
        queryBuilder.take(query.limit);

        const [rankedCharacterRankings, count] =
            await queryBuilder.getManyAndCount();

        return {
            data: rankedCharacterRankings,
            meta: {
                limit: query.limit,
                total: count,
            },
        };
    }

    public async findAllPhases() {
        const data = await this.query(`
            SELECT DISTINCT phase
            FROM sf6_ranked_character_ranking
            ORDER BY phase ASC;
        `);

        return {
            data: data,
        };
    }

    public async findAllWeeklyDatesByPhase(phase: number) {
        const data = await this.query(
            `
            WITH date_buckets AS (
            SELECT
                date,
                date_trunc('week', date) AS week_bucket,
                ROW_NUMBER() OVER (PARTITION BY date_trunc('week', date) ORDER BY date) AS rn
            FROM (
                SELECT DISTINCT date
                FROM sf6_ranked_character_ranking AS srcr
                WHERE srcr.phase = $1
            ) distinct_dates
            )
            SELECT date
            FROM date_buckets
            WHERE rn = 1
            ORDER BY date;
        `,
            [phase],
        );

        return {
            data: data,
        };
    }

    public async findAllRankedPlayerAndCharacterInfoByDateAndPhase(
        query: FindSfsixRankedCharacterRankingsQueryDto,
    ) {
        const data = await this.query(
            `
            SELECT
                srp.cfn,
                srp.usercode,
                srcr.rank,
                srcr.master_rating,
                srcr.league,
                src.character_name,
                srp.flag
            FROM sf6_ranked_character_ranking AS srcr
            JOIN sf6_ranked_character AS src ON srcr.sf6_ranked_character_id = src.sf6_ranked_character_id
            JOIN sf6_ranked_profile AS srp ON src.usercode = srp.usercode
            WHERE
                srcr.phase = $1
            AND srcr.date = $2
            ORDER BY srcr.rank
            LIMIT $3
        `,
            [query.phase, query.date.toISOString(), query.limit],
        );

        return {
            data: data,
            meta: {},
        };
    }

    public async findAllDistinctDatePhaseSeason() {
        const queryBuilder = this.createQueryBuilder("rankedCharacterRanking");

        queryBuilder
            .select([
                "rankedCharacterRanking.date",
                "rankedCharacterRanking.phase",
                "rankedCharacterRanking.season",
            ])
            .distinct(true)
            .orderBy("rankedCharacterRanking.date", "DESC");

        const data = await queryBuilder.getRawMany();

        return {
            data: data,
            meta: {},
        };
    }
}
