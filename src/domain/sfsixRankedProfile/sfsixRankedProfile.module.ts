import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SFSixRankedProfileController } from 'src/controllers/sfsixRankedProfile.controller';
import { SFSixRankedProfile } from 'src/domain/entities/sfsixRankedProfile.entity';
import { SFSixRankedProfileRepository } from 'src/domain/sfsixRankedProfile/sfsixRankedProfile.repository';
import { SFSixRankedProfileService } from 'src/domain/sfsixRankedProfile/sfsixRankedProfile.service';

@Module({
  imports: [TypeOrmModule.forFeature([SFSixRankedProfile])],
  providers: [SFSixRankedProfileService, SFSixRankedProfileRepository],
  controllers: [SFSixRankedProfileController],
  exports: [SFSixRankedProfileService],
})
export class SFSixRankedProfileModule {}
