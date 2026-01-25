import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SFSixRankedProfile } from "@domain/entities/sfsixRankedProfile.entity";
import { Player } from "@domain/entities/player.entity";
import { CreateSFSixRankedProfileDto } from "../dtos/request/create-sfsix-ranked-profile.dto";
import { FindSFSixRankedProfilesQueryDto } from "../dtos/request/find-sfsix-ranked-profiles-query.dto";

export class SFSixRankedProfileRepository extends Repository<SFSixRankedProfile> {
    constructor(
        @InjectRepository(SFSixRankedProfile)
        private repository: Repository<SFSixRankedProfile>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    /***
     * Create and save a new SFSixRankedProfile
     * @param rankedProfileDTO - DTO for creating a new SFSixRankedProfile
     * @returns The newly created SFSixRankedProfile
     * Links to Player entity if playerID provided
     */
    public async createAndSave(
        rankedProfileDTO: CreateSFSixRankedProfileDto,
    ): Promise<SFSixRankedProfile> {
        // Retrieve player if playerID provided
        let player = null;
        if (rankedProfileDTO.playerID)
            player = await this.manager
                .getRepository(Player)
                .findOneBy({ playerID: rankedProfileDTO.playerID });

        const profile = this.create({
            usercode: rankedProfileDTO.usercode,
            cfn: rankedProfileDTO.cfn,
            flag: rankedProfileDTO.flag,
            player: player,
        });

        // Save and return the new profile
        return await this.save(profile);
    }

    /**
     * Batch upsert profiles - inserts new profiles or ignores existing ones
     * Uses ON CONFLICT DO NOTHING since usercode is the primary key
     * @param profiles - Array of profile DTOs to upsert
     * @returns Number of profiles inserted
     */
    public async batchUpsert(
        profiles: CreateSFSixRankedProfileDto[],
    ): Promise<number> {
        if (profiles.length === 0) return 0;

        const result = await this.createQueryBuilder()
            .insert()
            .into(SFSixRankedProfile)
            .values(
                profiles.map((p) => ({
                    usercode: p.usercode,
                    cfn: p.cfn,
                    flag: p.flag,
                })),
            )
            .orIgnore() // ON CONFLICT DO NOTHING
            .execute();

        return result.identifiers.length;
    }

    public async findAll(query: FindSFSixRankedProfilesQueryDto) {
        const queryBuilder = this.createQueryBuilder("profile");

        // Apply filters if provided
        // !! Exact comparison wtih =  !!
        if (query.cfn) {
            queryBuilder.andWhere("profile.cfn = :cfn", {
                cfn: query.cfn,
            });
        }

        if (query.flag) {
            queryBuilder.andWhere("profile.flag = :flag", {
                flag: query.flag,
            });
        }

        // Add sorting
        if (query.sortBy) {
            queryBuilder.orderBy(`profile.${query.sortBy}`, query.order);
        }

        // Add limit
        queryBuilder.take(query.limit);

        const [rankedProfiles, count] = await queryBuilder.getManyAndCount();

        return {
            data: rankedProfiles,
            meta: {
                limit: query.limit,
                total: count,
            },
        };
    }
}
