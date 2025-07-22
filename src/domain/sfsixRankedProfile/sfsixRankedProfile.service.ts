import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    CreateSFSixRankedProfileDTO,
    FindSFSixRankedProfilesQueryDTO,
    UpdateSFSixRankedProfileDTO,
} from "src/dtos/sfsixRankedProfile.dto";
import { SFSixRankedProfile } from "src/domain/entities/sfsixRankedProfile.entity";
import { SFSixRankedProfileRepository } from "src/domain/sfsixRankedProfile/sfsixRankedProfile.repository";

@Injectable()
export class SFSixRankedProfileService {
    constructor(
        @InjectRepository(SFSixRankedProfileRepository)
        private readonly repository: SFSixRankedProfileRepository,
    ) {}

    public async create(
        rankedProfileDTO: CreateSFSixRankedProfileDTO,
    ): Promise<SFSixRankedProfile> {
        return await this.repository.createAndSave(rankedProfileDTO);
    }

    public async findAll(query: FindSFSixRankedProfilesQueryDTO) {
        return await this.repository.findAll(query);
    }

    public async findById(id: number): Promise<SFSixRankedProfile> {
        return await this.repository.findOneBy({ usercode: id });
    }

    public async update(
        id: number,
        updateSFSixRankedProfileDTO: UpdateSFSixRankedProfileDTO,
    ): Promise<SFSixRankedProfile> {
        const profile = await this.repository.findOneBy({ usercode: id });

        if (!profile) {
            return null;
        }

        await this.repository.update(
            { usercode: id },
            updateSFSixRankedProfileDTO,
        );
        return await this.repository.findOneBy({ usercode: id });
    }

    public async remove(id: number): Promise<boolean> {
        const result = await this.repository.delete({ usercode: id });
        return result.affected > 0;
    }
}
