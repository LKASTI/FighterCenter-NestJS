import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    CreatePlayerDTO,
    FindPlayersQueryDTO,
    UpdatePlayerDTO,
} from "src/dtos/player.dto";
import { Player } from "src/domain/entities/player.entity";
import { PlayerRepository } from "src/domain/player/player.repository";

@Injectable()
export class PlayerService {
    constructor(
        @InjectRepository(PlayerRepository)
        private readonly playerRepository: PlayerRepository,
    ) {}

    public async create(createPlayerDTO: CreatePlayerDTO): Promise<Player> {
        return await this.playerRepository.createAndSave(createPlayerDTO);
    }

    public async findAll(query: FindPlayersQueryDTO) {
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
        updatePlayerDTO: UpdatePlayerDTO,
    ): Promise<Player> {
        const player = await this.playerRepository.findOneBy({ playerID: id });

        if (!player) {
            return null;
        }

        await this.playerRepository.update({ playerID: id }, updatePlayerDTO);
        return await this.playerRepository.findOneBy({ playerID: id });
    }

    public async remove(id: number): Promise<boolean> {
        const result = await this.playerRepository.delete({ playerID: id });
        return result.affected > 0;
    }
}
