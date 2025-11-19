import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SFSixGamePatchRepository } from "../repositories/sfsix-game-patch.repository";
import { FindSFSixGamePatchQueryDto } from "../dtos/request/find-sfsix-game-patch-query.dto";

@Injectable()
export class SFSixGamePatchService {
    constructor(
        @InjectRepository(SFSixGamePatchRepository)
        private readonly sfsixGamePatchRepository: SFSixGamePatchRepository
    ) {}

    public async findAll(query: FindSFSixGamePatchQueryDto) {
        return await this.sfsixGamePatchRepository.findAll(query);
    }
}
