import { Module } from "@nestjs/common";
import { PlayerTournamentRunModule } from "@domain/playerTournamentRun/player-tournament-run.module";
import { PlayerModule } from "@domain/player/player.module";
import { EventModule } from "@domain/event/event.module";
import { TournamentSeriesService } from "./services/tournament-series.service";
import { TournamentSetModule } from "@domain/tournamentSet/tournamentSet.module";
import { TournamentSeriesRepository } from "./repositories/tournament-series.repository";
import { TournamentSeriesController } from "./controllers/tournament-series.controller";
import { TournamentModule } from "@domain/tournament/tournament.module";
import { CommonModule } from "@common/common.module";

@Module({
    imports: [
        PlayerTournamentRunModule,
        TournamentSetModule,
        PlayerModule,
        EventModule,
        TournamentModule,
        CommonModule
    ],
    providers: [TournamentSeriesService, TournamentSeriesRepository],
    controllers: [TournamentSeriesController],
    exports: [TournamentSeriesService],
})
export class TournamentSeriesModule {}
