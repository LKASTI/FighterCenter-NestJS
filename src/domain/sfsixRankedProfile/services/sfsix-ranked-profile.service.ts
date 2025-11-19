import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SFSixRankedProfile } from "@domain/entities/sfsixRankedProfile.entity";
import { SFSixRankedProfileRepository } from "../repositories/sfsix-ranked-profile.repository";
import { CreateSFSixRankedProfileDto } from "../dtos/request/create-sfsix-ranked-profile.dto";
import { UpdateSFSixRankedProfileDto } from "../dtos/request/update-sfsix-ranked-profile.dto";
import { FindSFSixRankedProfilesQueryDto } from "../dtos/request/find-sfsix-ranked-profiles-query.dto";

@Injectable()
export class SFSixRankedProfileService {
    constructor(
        @InjectRepository(SFSixRankedProfileRepository)
        private readonly repository: SFSixRankedProfileRepository,
    ) {}

    public async create(
        rankedProfileDTO: CreateSFSixRankedProfileDto,
    ): Promise<SFSixRankedProfile> {
        return await this.repository.createAndSave(rankedProfileDTO);
    }

    public async findAll(query: FindSFSixRankedProfilesQueryDto) {
        return await this.repository.findAll(query);
    }

    public async findById(id: number): Promise<SFSixRankedProfile> {
        return await this.repository.findOneBy({ usercode: id });
    }

    public async update(
        id: number,
        updateSFSixRankedProfileDTO: UpdateSFSixRankedProfileDto,
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
