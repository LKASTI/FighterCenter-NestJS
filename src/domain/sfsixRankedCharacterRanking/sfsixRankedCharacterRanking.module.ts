import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SFSixRankedCharacterRankingController } from 'src/controllers/sfsixRankedCharacterRanking.controller';
import { SFSixRankedCharacterRanking } from 'src/domain/entities/sfsixRankedCharacterRanking.entity';
import { SFSixRankedCharacterRankingRepository } from 'src/domain/sfsixRankedCharacterRanking/sfsixRankedCharacterRanking.repository';
import { SFSixRankedCharacterRankingService } from 'src/domain/sfsixRankedCharacterRanking/sfsixRankedCharacterRanking.service';

@Module({
  imports: [TypeOrmModule.forFeature([SFSixRankedCharacterRanking])],
  providers: [
    SFSixRankedCharacterRankingService,
    SFSixRankedCharacterRankingRepository,
    Logger
  ],
  controllers: [SFSixRankedCharacterRankingController],
  exports: [SFSixRankedCharacterRankingService],
})
export class SFSixRankedCharacterRankingModule {}
