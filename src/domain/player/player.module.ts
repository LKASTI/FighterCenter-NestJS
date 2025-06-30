import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerController } from 'src/controllers/player.controller';
import { Player } from 'src/domain/entities/player.entity';
import { PlayerRepository } from 'src/domain/player/player.repository';
import { PlayerService } from 'src/domain/player/player.service';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  providers: [PlayerService, PlayerRepository],
  controllers: [PlayerController],
  exports: [PlayerService, PlayerRepository],
})
export class PlayerModule {}
