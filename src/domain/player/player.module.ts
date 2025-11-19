import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Player } from "@domain/entities/player.entity";
import { PlayerController } from "./controllers/player.controller";
import { PlayerService } from "./services/player.service";
import { PlayerRepository } from "./repositories/player.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Player])],
    providers: [PlayerService, PlayerRepository],
    controllers: [PlayerController],
    exports: [PlayerService, PlayerRepository],
})
export class PlayerModule {}
