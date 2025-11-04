import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TournamentController } from "src/controllers/tournament.controller";
import { Tournament } from "src/domain/entities/tournament.entity";
import { TournamentService } from "src/domain/tournament/tournament.service";
import { TournamentRepository } from "src/domain/tournament/tournament.repository";
import { CommonModule } from "../../common/common.module";

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
