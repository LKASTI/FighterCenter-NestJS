import { InjectRepository } from "@nestjs/typeorm";
import { Player } from "@domain/entities/player.entity";
import { Repository } from "typeorm";
import { CreatePlayerDto } from "../dtos/request/create-player.dto";
import { FindPlayersQueryDto } from "../dtos/request/find-players-query.dto";
import { Logger } from "@nestjs/common";

export class PlayerRepository extends Repository<Player> {
    private readonly logger = new Logger(PlayerRepository.name);

    constructor(
        @InjectRepository(Player)
        private playerRepository: Repository<Player>,
    ) {
        super(
            playerRepository.target,
            playerRepository.manager,
            playerRepository.queryRunner,
        );
    }

    public async createAndSave(player: CreatePlayerDto): Promise<Player> {
        try {
            const newPlayer = this.playerRepository.create(player);
            const savedPlayer = await this.playerRepository.save(newPlayer);
            return savedPlayer;
        } catch (error) {
            this.logger.error("Error in player createAndSave: ", error);
            throw error;
        }
    }

    public async findAll(query: FindPlayersQueryDto) {
        const queryBuilder = this.createQueryBuilder("player");

        // Apply filters if provided

        // !! Exact comparison with =  !!
        if (query.playerName) {
            queryBuilder.andWhere("player.playerName = :playerName", {
                playerName: query.playerName,
            });
        }

        if (query.startggProfileImageURL) {
            queryBuilder.andWhere(
                "player.startggProfileImageURL = :startggProfileImageURL",
                {
                    startggProfileImageURL: query.startggProfileImageURL,
                },
            );
        }

        if (query.country) {
            queryBuilder.andWhere("player.country = :country", {
                country: query.country,
            });
        }

        // Add sorting with whitelist validation (defense in depth)
        const ALLOWED_SORT_FIELDS = ["playerName", "country", "startggPlayerID", "startggProfileImageURL"];
        if (query.sortBy) {
            if (!ALLOWED_SORT_FIELDS.includes(query.sortBy)) {
                throw new Error(`Invalid sort field: ${query.sortBy}`);
            }
            queryBuilder.orderBy(`player.${query.sortBy}`, query.order);
        }

        // Add limit
        queryBuilder.take(query.limit);

        // Get results and count
        const [players, total] = await queryBuilder.getManyAndCount();

        return {
            data: players,
            meta: {
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }
}
