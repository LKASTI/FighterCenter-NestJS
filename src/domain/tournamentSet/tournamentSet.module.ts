import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TournamentSetController } from "src/controllers/tournamentSet.controller";
import { TournamentSet } from "src/domain/entities/tournamentSet.entity";
import { TournamentSetRepository } from "src/domain/tournamentSet/tournamentSet.repository";
import { TournamentSetService } from "src/domain/tournamentSet/tournamentSet.service";

@Module({
    imports: [TypeOrmModule.forFeature([TournamentSet])],
    providers: [TournamentSetService, TournamentSetRepository],
    controllers: [TournamentSetController],
    exports: [TournamentSetService],
})
export class TournamentSetModule {}
