import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SFSixGamePatch } from "../entities/sfsixGamePatch.entity";
import { SFSixGamePatchRepository } from "./sfsixGamePatch.repository";
import { FindSFSixGamePatchDTO } from "../../dtos/sfsixGamePatch.dto";


@Injectable()
export class SFSixGamePatchService{
    constructor(
        @InjectRepository(SFSixGamePatchRepository)
        private readonly sfsixGamePatchRepository: SFSixGamePatchRepository
    ) {}

    public async findAll(query: FindSFSixGamePatchDTO) {
        return await this.sfsixGamePatchRepository.findAll(query);
    }
    
}