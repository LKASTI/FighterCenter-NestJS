import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Player } from "@domain/entities/player.entity";
import { PlayerRepository } from "../repositories/player.repository";
import { CreatePlayerDto } from "../dtos/request/create-player.dto";
import { UpdatePlayerDto } from "../dtos/request/update-player.dto";
import { FindPlayersQueryDto } from "../dtos/request/find-players-query.dto";

@Injectable()
export class PlayerService {
    constructor(
        @InjectRepository(PlayerRepository)
        private readonly playerRepository: PlayerRepository,
    ) {}

    public async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
        return await this.playerRepository.createAndSave(createPlayerDto);
    }

    public async findAll(query: FindPlayersQueryDto) {
        return await this.playerRepository.findAll(query);
    }

    public async findById(id: number): Promise<Player> {
        return await this.playerRepository.findOneBy({ playerID: id });
    }

    public async findByStartGGId(id: number): Promise<Player> {
        return await this.playerRepository.findOneBy({ startggPlayerID: id });
    }

    public async update(
        id: number,
        updatePlayerDto: UpdatePlayerDto,
    ): Promise<Player> {
        const player = await this.playerRepository.findOneBy({ playerID: id });

        if (!player) {
            return null;
        }

        await this.playerRepository.update({ playerID: id }, updatePlayerDto);
        return await this.playerRepository.findOneBy({ playerID: id });
    }

    public async remove(id: number): Promise<boolean> {
        const result = await this.playerRepository.delete({ playerID: id });
        return result.affected > 0;
    }
}
