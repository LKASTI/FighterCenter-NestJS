import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SFSixRankedProfile } from "src/domain/entities/sfsixRankedProfile.entity";
import {
    CreateSFSixRankedProfileDTO,
    FindSFSixRankedProfilesQueryDTO,
} from "src/dtos/sfsixRankedProfile.dto";
import { Player } from "src/domain/entities/player.entity";

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
        rankedProfileDTO: CreateSFSixRankedProfileDTO,
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

    public async findAll(query: FindSFSixRankedProfilesQueryDTO) {
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
