import { Module } from "@nestjs/common";
import { PlayerTournamentRunModule } from "../../domain/playerTournamentRun/playerTournamentRun.module";
import { PlayerModule } from "../../domain/player/player.module";
import { EventModule } from "../../domain/event/event.module";
import { TournamentSeriesService } from "./TournamentSeries.service";
import { TournamentSetModule } from "../../domain/tournamentSet/tournamentSet.module";
import { TournamentSeriesRepository } from "./TournamentSeries.repository";
import { TournamentSeriesController } from "../../controllers/TournamentSeries.controller";

@Module({
    imports: [
        PlayerTournamentRunModule,
        TournamentSetModule,
        PlayerModule,
        EventModule,
    ],
    providers: [TournamentSeriesService, TournamentSeriesRepository],
    controllers: [TournamentSeriesController],
    exports: [TournamentSeriesService],
})
export class TournamentSeriesModule {}
