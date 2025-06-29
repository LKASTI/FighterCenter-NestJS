import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentMatchController } from 'src/controllers/tournamentMatch.controller';
import { TournamentMatch } from 'src/domain/entities/tournamentMatch.entity';
import { TournamentMatchRepository } from 'src/domain/tournamentMatch/tournamentMatch.repository';
import { TournamentMatchService } from 'src/domain/tournamentMatch/tournamentMatch.service';

@Module({
  imports: [TypeOrmModule.forFeature([TournamentMatch])],
  providers: [TournamentMatchService, TournamentMatchRepository],
  controllers: [TournamentMatchController],
  exports: [TournamentMatchService],
})
export class TournamentMatchModule {}
