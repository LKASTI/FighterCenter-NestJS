import { Repository } from "typeorm";
import { SFSixGamePatch } from "../entities/sfsixGamePatch.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindSFSixGamePatchDTO } from "../../dtos/sfsixGamePatch.dto";

export class SFSixGamePatchRepository extends Repository<SFSixGamePatch> {
    constructor(
        @InjectRepository(SFSixGamePatch)
        private repository: Repository<SFSixGamePatch>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async findAll(query: FindSFSixGamePatchDTO) {
        const queryBuilder = this.createQueryBuilder("gamePatch");

        // Apply filters if provided
        if (query.patchVersion) {
            queryBuilder.andWhere("gamePatch.patchVersion = :patchVersion", {
                patchVersion: query.patchVersion,
            });
        }

        if(query.patchDate) {
            queryBuilder.andWhere("gamePatch.patchDate = :patchDate", {
                date: query.patchDate.toISOString(),
            });
        }

        // Add sorting
        if (query.sortBy) {
            queryBuilder.orderBy(
                `gamePatch.${query.sortBy}`,
                query.order,
            );
        }

        const gamePatches = await queryBuilder.getMany();
        return {
            data: gamePatches
        };
    }
}