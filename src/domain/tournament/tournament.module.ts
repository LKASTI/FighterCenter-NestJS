import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TournamentController } from "src/controllers/tournament.controller";
import { Tournament } from "src/domain/entities/tournament.entity";
import { TournamentService } from "src/domain/tournament/tournament.service";
import { TournamentRepository } from "src/domain/tournament/tournament.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Tournament])],
    providers: [TournamentService, TournamentRepository],
    controllers: [TournamentController],
    exports: [TournamentService],
})
export class TournamentModule {}
