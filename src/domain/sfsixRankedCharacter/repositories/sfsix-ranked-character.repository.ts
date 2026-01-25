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

    /**
     * Batch upsert characters - inserts new characters or ignores existing ones
     * Uses ON CONFLICT DO NOTHING on (usercode, character_name) unique constraint
     * @param characters - Array of character DTOs to upsert
     * @returns Number of characters inserted
     */
    public async batchUpsert(
        characters: CreateSFSixRankedCharacterDto[],
    ): Promise<number> {
        if (characters.length === 0) return 0;

        const result = await this.createQueryBuilder()
            .insert()
            .into(SFSixRankedCharacter)
            .values(
                characters.map((c) => ({
                    usercode: c.usercode,
                    characterName: c.characterName,
                })),
            )
            .orIgnore() // ON CONFLICT DO NOTHING
            .execute();

        return result.identifiers.length;
    }

    /**
     * Find all characters by usercode and character names (batch lookup)
     * @param lookups - Array of { usercode, characterName } to find
     * @returns Map of "usercode-characterName" to SFSixRankedCharacter
     */
    public async findByUsercodeAndCharacterBatch(
        lookups: { usercode: number; characterName: string }[],
    ): Promise<Map<string, SFSixRankedCharacter>> {
        if (lookups.length === 0) return new Map();

        // Get unique usercodes for efficient query
        const usercodes = [...new Set(lookups.map((l) => l.usercode))];

        const characters = await this.createQueryBuilder("char")
            .where("char.usercode IN (:...usercodes)", { usercodes })
            .getMany();

        // Create lookup map with "usercode-characterName" as key
        const resultMap = new Map<string, SFSixRankedCharacter>();
        for (const char of characters) {
            const key = `${char.usercode}-${char.characterName}`;
            resultMap.set(key, char);
        }

        return resultMap;
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
