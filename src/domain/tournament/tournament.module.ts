import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tournament } from "@domain/entities/tournament.entity";
import { TournamentController } from "./controllers/tournament.controller";
import { TournamentService } from "./services/tournament.service";
import { TournamentRepository } from "./repositories/tournament.repository";
import { CommonModule } from "@common/common.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Tournament]),
        CommonModule
    ],
    providers: [TournamentService, TournamentRepository],
    controllers: [TournamentController],
    exports: [TournamentService],
})
export class TournamentModule {}
