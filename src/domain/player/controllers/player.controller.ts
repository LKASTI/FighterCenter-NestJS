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
import { Player } from "@domain/entities/player.entity";
import { PlayerService } from "../services/player.service";
import { CreatePlayerDto } from "../dtos/request/create-player.dto";
import { UpdatePlayerDto } from "../dtos/request/update-player.dto";
import { FindPlayersQueryDto } from "../dtos/request/find-players-query.dto";
import {
    ApiPlayerPost,
    ApiPlayerGet,
    ApiPlayerPatch,
    ApiPlayerDelete
} from "../decorators/player-swagger.decorators";

@Controller("player")
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Post()
    @ApiPlayerPost("Create a new player", Player, true)
    async create(
        @Body(new ValidationPipe()) createPlayerDto: CreatePlayerDto,
    ): Promise<Player> {
        return await this.playerService.create(createPlayerDto);
    }

    @Get()
    @ApiPlayerGet("Get all players with optional filters")
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindPlayersQueryDto,
    ) {
        return await this.playerService.findAll(query);
    }

    @Get(":id")
    @ApiPlayerGet("Get a player by ID", Player)
    async findByID(@Param("id", ParseIntPipe) id: number): Promise<Player> {
        const player = await this.playerService.findById(id);
        if (!player) {
            throw new NotFoundException(`Player with ID ${id} not found`);
        }
        return player;
    }

    @Patch(":id")
    @ApiPlayerPatch("Update a player by ID", Player, true)
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updatePlayerDto: UpdatePlayerDto,
    ): Promise<Player> {
        const player = await this.playerService.update(id, updatePlayerDto);
        if (!player) {
            throw new NotFoundException(`Player with ID ${id} not found`);
        }
        return player;
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiPlayerDelete("Delete a player by ID", true)
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.playerService.remove(id);
        if (!result) {
            throw new NotFoundException(`Player with ID ${id} not found`);
        }
    }
}
