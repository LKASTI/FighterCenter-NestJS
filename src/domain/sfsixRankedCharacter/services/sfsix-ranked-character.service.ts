import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SFSixRankedCharacter } from "@domain/entities/sfsixRankedCharacter.entity";
import { SFSixRankedCharacterRepository } from "../repositories/sfsix-ranked-character.repository";
import { CreateSFSixRankedCharacterDto } from "../dtos/request/create-sfsix-ranked-character.dto";
import { UpdateSFSixRankedCharacterDto } from "../dtos/request/update-sfsix-ranked-character.dto";
import { FindSFSixRankedCharactersQueryDto } from "../dtos/request/find-sfsix-ranked-characters-query.dto";

@Injectable()
export class SFSixRankedCharacterService {
    constructor(
        @InjectRepository(SFSixRankedCharacterRepository)
        private readonly repository: SFSixRankedCharacterRepository,
    ) {}

    public async create(
        sfsixRankedCharacterDTO: CreateSFSixRankedCharacterDto,
    ): Promise<SFSixRankedCharacter> {
        return await this.repository.createAndSave(sfsixRankedCharacterDTO);
    }

    public async findAll(query: FindSFSixRankedCharactersQueryDto) {
        return await this.repository.findAll(query);
    }

    public async findById(id: number): Promise<SFSixRankedCharacter> {
        return await this.repository.findOneBy({ sfsixRankedCharacterID: id });
    }

    public async findOneBy(
        query: FindSFSixRankedCharactersQueryDto,
    ): Promise<SFSixRankedCharacter> {
        return await this.repository.findOneBy(query);
    }

    public async update(
        id: number,
        updateSFSixRankedCharacterDTO: UpdateSFSixRankedCharacterDto,
    ): Promise<SFSixRankedCharacter> {
        const rankedCharacter = await this.repository.findOneBy({
            sfsixRankedCharacterID: id,
        });

        if (!rankedCharacter) {
            return null;
        }

        await this.repository.update(
            { sfsixRankedCharacterID: id },
            updateSFSixRankedCharacterDTO,
        );
        return await this.repository.findOneBy({ sfsixRankedCharacterID: id });
    }

    public async remove(id: number): Promise<boolean> {
        const result = await this.repository.delete({
            sfsixRankedCharacterID: id,
        });
        return result.affected > 0;
    }
}
