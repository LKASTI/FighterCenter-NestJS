import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TournamentMatch } from "@domain/entities/tournamentMatch.entity";
import { TournamentMatchController } from "./controllers/tournament-match.controller";
import { TournamentMatchService } from "./services/tournament-match.service";
import { TournamentMatchRepository } from "./repositories/tournament-match.repository";

@Module({
    imports: [TypeOrmModule.forFeature([TournamentMatch])],
    providers: [TournamentMatchService, TournamentMatchRepository],
    controllers: [TournamentMatchController],
    exports: [TournamentMatchService, TournamentMatchRepository],
})
export class TournamentMatchModule {}
