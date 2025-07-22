import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    ValidationPipe,
} from "@nestjs/common";
import {
    CreatePlayerDTO,
    FindPlayersQueryDTO,
    UpdatePlayerDTO,
} from "src/dtos/player.dto";
import { Player } from "src/domain/entities/player.entity";
import { PlayerService } from "src/domain/player/player.service";

@Controller("player")
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Post()
    async create(
        @Body(new ValidationPipe()) createPlayerDTO: CreatePlayerDTO,
    ): Promise<Player> {
        return await this.playerService.create(createPlayerDTO);
    }

    @Get()
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindPlayersQueryDTO,
    ) {
        return await this.playerService.findAll(query);
    }

    @Get(":id")
    async findByID(@Param("id", ParseIntPipe) id: number): Promise<Player> {
        const player = await this.playerService.findById(id);
        if (!player) {
            throw new NotFoundException(`Player with ID ${id} not found`);
        }
        return player;
    }

    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updatePlayerDto: UpdatePlayerDTO,
    ): Promise<Player> {
        const player = await this.playerService.update(id, updatePlayerDto);
        if (!player) {
            throw new NotFoundException(`Player with ID ${id} not found`);
        }
        return player;
    }

    @Delete(":id")
    @HttpCode(204) // No Content
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.playerService.remove(id);
        if (!result) {
            throw new NotFoundException(`Player with ID ${id} not found`);
        }
    }
}
