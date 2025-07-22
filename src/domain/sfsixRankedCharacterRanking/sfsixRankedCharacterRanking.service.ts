import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    CreateSFSixRankedCharacterRankingDTO,
    FindSFSixRankedCharacterRankingsQueryDTO,
    UpdateSFSixRankedCharacterRankingDTO,
} from "src/dtos/sfsixRankedCharacterRanking.dto";
import { SFSixRankedCharacterRanking } from "src/domain/entities/sfsixRankedCharacterRanking.entity";
import { SFSixRankedCharacterRankingRepository } from "src/domain/sfsixRankedCharacterRanking/sfsixRankedCharacterRanking.repository";

@Injectable()
export class SFSixRankedCharacterRankingService {
    constructor(
        @InjectRepository(SFSixRankedCharacterRankingRepository)
        private readonly repository: SFSixRankedCharacterRankingRepository,
    ) {}

    public async create(
        sfsixRankedCharacterRankingDTO: CreateSFSixRankedCharacterRankingDTO,
    ): Promise<SFSixRankedCharacterRanking> {
        return await this.repository.createAndSave(
            sfsixRankedCharacterRankingDTO,
        );
    }

    public async findAll(query: FindSFSixRankedCharacterRankingsQueryDTO) {
        return await this.repository.findAll(query);
    }

    public async findAllPhases() {
        return await this.repository.findAllPhases();
    }

    public async findAllWeeklyDatesByPhase(phase: number) {
        return await this.repository.findAllWeeklyDatesByPhase(phase);
    }

    public async findAllRankedPlayerAndCharacterInfoByDateAndPhase(
        query: FindSFSixRankedCharacterRankingsQueryDTO,
    ) {
        return await this.repository.findAllRankedPlayerAndCharacterInfoByDateAndPhase(
            query,
        );
    }

    public async findAllDistinctDatePhaseSeason() {
        return await this.repository.findAllDistinctDatePhaseSeason();
    }

    public async findById(id: number): Promise<SFSixRankedCharacterRanking> {
        return await this.repository.findOneBy({
            sfsixRankedCharacterRankingID: id,
        });
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
