import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    CreateSFSixRankedCharacterDTO,
    FindSFSixRankedCharactersQueryDTO,
    UpdateSFSixRankedCharacterDTO,
} from "src/dtos/sfsixRankedCharacter.dto";
import { SFSixRankedCharacter } from "src/domain/entities/sfsixRankedCharacter.entity";
import { SFSixRankedCharacterRepository } from "src/domain/sfsixRankedCharacter/sfsixRankedCharacter.repository";

@Injectable()
export class SFSixRankedCharacterService {
    constructor(
        @InjectRepository(SFSixRankedCharacterRepository)
        private readonly repository: SFSixRankedCharacterRepository,
    ) {}

    public async create(
        sfsixRankedCharacterDTO: CreateSFSixRankedCharacterDTO,
    ): Promise<SFSixRankedCharacter> {
        return await this.repository.createAndSave(sfsixRankedCharacterDTO);
    }

    public async findAll(query: FindSFSixRankedCharactersQueryDTO) {
        return await this.repository.findAll(query);
    }

    public async findById(id: number): Promise<SFSixRankedCharacter> {
        return await this.repository.findOneBy({ sfsixRankedCharacterID: id });
    }

    public async findOneBy(
        query: FindSFSixRankedCharactersQueryDTO,
    ): Promise<SFSixRankedCharacter> {
        return await this.repository.findOneBy(query);
    }

    public async update(
        id: number,
        updateSFSixRankedCharacterDTO: UpdateSFSixRankedCharacterDTO,
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
