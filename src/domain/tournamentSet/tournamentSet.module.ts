import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TournamentSet } from "@domain/entities/tournamentSet.entity";
import { CommonModule } from "@common/common.module";
import { TournamentSetController } from "./controllers/tournament-set.controller";
import { TournamentSetService } from "./services/tournament-set.service";
import { TournamentSetRepository } from "./repositories/tournament-set.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([TournamentSet]),
        CommonModule
    ],
    providers: [TournamentSetService, TournamentSetRepository],
    controllers: [TournamentSetController],
    exports: [TournamentSetService, TournamentSetRepository],
})
export class TournamentSetModule {}
