import { Repository } from "typeorm";
import { StartggUser } from "@entities/startggUser.entity";
import { InjectRepository } from "@nestjs/typeorm";
import {
    CreateStartggUserDto,
    FindStartggUsersQueryDto,
} from "../dtos/request";

export class StartggUserRepository extends Repository<StartggUser> {
    constructor(
        @InjectRepository(StartggUser)
        private repository: Repository<StartggUser>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async createAndSave(
        startggUser: CreateStartggUserDto,
    ): Promise<StartggUser> {
        const newStartggUser = this.repository.create(startggUser);
        return await this.save(newStartggUser);
    }

    public async findAll(query: FindStartggUsersQueryDto) {
        const queryBuilder = this.repository.createQueryBuilder("startggUser");

        if (query.startggUsername) {
            queryBuilder.andWhere(
                "startggUser.startggUsername = :startggUsername",
                {
                    startggUsername: query.startggUsername,
                },
            );
        }

        if (query.startggGamerTag) {
            queryBuilder.andWhere(
                "startggUser.startggGamerTag = :startggGamerTag",
                {
                    startggGamerTag: query.startggGamerTag,
                },
            );
        }

        if (query.startggUserID) {
            queryBuilder.andWhere(
                "startggUser.startggUserID = :startggUserID",
                {
                    startggUserID: query.startggUserID,
                },
            );
        }

        if (query.startggId) {
            queryBuilder.andWhere("startggUser.startggId = :startggId", {
                startggId: query.startggId,
            });
        }

        if (query.sortBy) {
            queryBuilder.orderBy(`startggUser.${query.sortBy}`, query.order);
        }

        queryBuilder.take(query.limit);

        const [startggUsers, total] = await queryBuilder.getManyAndCount();

        return {
            data: startggUsers,
            meta: {
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }
}
