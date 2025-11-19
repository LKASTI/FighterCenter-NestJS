import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlayerTournamentRunController } from "./controllers/player-tournament-run.controller";
import { PlayerTournamentRun } from "@entities/playerTournamentRun.entity";
import { PlayerTournamentRunRepository } from "./repositories/player-tournament-run.repository";
import { PlayerTournamentRunService } from "./services/player-tournament-run.service";

@Module({
    imports: [TypeOrmModule.forFeature([PlayerTournamentRun])],
    providers: [PlayerTournamentRunService, PlayerTournamentRunRepository],
    controllers: [PlayerTournamentRunController],
    exports: [PlayerTournamentRunService, PlayerTournamentRunRepository],
})
export class PlayerTournamentRunModule {}
