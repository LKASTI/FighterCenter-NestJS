import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TournamentSetController } from "src/controllers/tournamentSet.controller";
import { TournamentSet } from "src/domain/entities/tournamentSet.entity";
import { TournamentSetRepository } from "src/domain/tournamentSet/tournamentSet.repository";
import { TournamentSetService } from "src/domain/tournamentSet/tournamentSet.service";
import { CommonModule } from "../../common/common.module";

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
