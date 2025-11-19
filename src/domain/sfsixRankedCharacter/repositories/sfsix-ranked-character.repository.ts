import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common/exceptions/not-found.exception";
import { SFSixRankedCharacter } from "@domain/entities/sfsixRankedCharacter.entity";
import { SFSixRankedProfile } from "@domain/entities/sfsixRankedProfile.entity";
import { CreateSFSixRankedCharacterDto } from "../dtos/request/create-sfsix-ranked-character.dto";
import { FindSFSixRankedCharactersQueryDto } from "../dtos/request/find-sfsix-ranked-characters-query.dto";

export class SFSixRankedCharacterRepository extends Repository<SFSixRankedCharacter> {
    constructor(
        @InjectRepository(SFSixRankedCharacter)
        private repository: Repository<SFSixRankedCharacter>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    /***
     * Create and save a new SFSixRankedCharacter
     * @param sfsfixRankedCharacterDTO - DTO for creating a new SFSixRankedCharacter
     * @returns The newly created SFSixRankedCharacter
     * DTO must contain usercode to link to SFSixRankedProfile
     */
    public async createAndSave(
        sfsfixRankedCharacterDTO: CreateSFSixRankedCharacterDto,
    ): Promise<SFSixRankedCharacter> {
        // Retrieve profile if usercode provided
        const sfsixRankedProfile = await this.manager
            .getRepository(SFSixRankedProfile)
            .findOneBy({ usercode: sfsfixRankedCharacterDTO.usercode });

        if (!sfsixRankedProfile)
            throw new NotFoundException(
                `SFSixRankedProfile with usercode ${sfsfixRankedCharacterDTO.usercode} not found`,
            );

        const rankedCharacter = this.create({
            sfsixRankedProfile: sfsixRankedProfile,
            characterName: sfsfixRankedCharacterDTO.characterName,
        });

        // Save and return the new rankedCharacter
        return await this.save(rankedCharacter);
    }

    public async findAll(query: FindSFSixRankedCharactersQueryDto) {
        const queryBuilder = this.createQueryBuilder("rankedCharacter");

        // Apply filters if provided
        // !! Exact comparison wtih =  !!
        if (query.characterName) {
            queryBuilder.andWhere(
                "rankedCharacter.characterName = :characterName",
                {
                    characterName: query.characterName,
                },
            );
        }

        // Add sorting
        if (query.sortBy) {
            queryBuilder.orderBy(
                `rankedCharacter.${query.sortBy}`,
                query.order,
            );
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
