import { Repository } from "typeorm";
import { SFSixGamePatch } from "@domain/entities/sfsixGamePatch.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindSFSixGamePatchQueryDto } from "../dtos/request/find-sfsix-game-patch-query.dto";

export class SFSixGamePatchRepository extends Repository<SFSixGamePatch> {
    constructor(
        @InjectRepository(SFSixGamePatch)
        private repository: Repository<SFSixGamePatch>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async findAll(query: FindSFSixGamePatchQueryDto) {
        const queryBuilder = this.createQueryBuilder("gamePatch");

        // Apply filters if provided
        if (query.patchVersion) {
            queryBuilder.andWhere("gamePatch.patchVersion = :patchVersion", {
                patchVersion: query.patchVersion,
            });
        }

        if (query.patchDate) {
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
