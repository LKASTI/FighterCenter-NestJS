import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlayerTournamentRunController } from "src/controllers/playerTournamentRun.controller";
import { PlayerTournamentRun } from "src/domain/entities/playerTournamentRun.entity";
import { PlayerTournamentRunRepository } from "src/domain/playerTournamentRun/playerTournamentRun.repository";
import { PlayerTournamentRunService } from "src/domain/playerTournamentRun/playerTournamentRun.service";

@Module({
    imports: [TypeOrmModule.forFeature([PlayerTournamentRun])],
    providers: [PlayerTournamentRunService, PlayerTournamentRunRepository],
    controllers: [PlayerTournamentRunController],
    exports: [PlayerTournamentRunService, PlayerTournamentRunRepository],
})
export class PlayerTournamentRunModule {}
