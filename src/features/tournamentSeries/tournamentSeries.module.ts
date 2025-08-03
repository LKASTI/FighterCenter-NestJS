import { Module } from "@nestjs/common";
import { PlayerTournamentRunModule } from "../../domain/playerTournamentRun/playerTournamentRun.module";
import { PlayerModule } from "../../domain/player/player.module";
import { EventModule } from "../../domain/event/event.module";
import { TournamentSeriesService } from "./tournamentSeries.service";
import { TournamentSetModule } from "../../domain/tournamentSet/tournamentSet.module";
import { TournamentSeriesRepository } from "./tournamentSeries.repository";
import { TournamentSeriesController } from "../../controllers/tournamentSeries.controller";
import { TournamentModule } from "../../domain/tournament/tournament.module";

@Module({
    imports: [
        PlayerTournamentRunModule,
        TournamentSetModule,
        PlayerModule,
        EventModule,
        TournamentModule
    ],
    providers: [TournamentSeriesService, TournamentSeriesRepository],
    controllers: [TournamentSeriesController],
    exports: [TournamentSeriesService],
})
export class TournamentSeriesModule {}
