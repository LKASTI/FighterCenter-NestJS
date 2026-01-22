import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechLibrary } from 'src/domain/entities/techLibrary.entity';
import { TechLibraryRepository } from 'src/domain/techLibrary/techLibrary.repository';
import { TechLibraryService } from 'src/domain/techLibrary/techLibrary.service';
import { TechLibraryController } from 'src/controllers/techLibrary.controller';
import { SharedTechEntry } from 'src/domain/entities/sharedTechEntry.entity';
import { SharedTechEntryRepository } from 'src/domain/sharedTechEntry/sharedTechEntry.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TechLibrary, SharedTechEntry])],
  providers: [TechLibraryService, TechLibraryRepository, SharedTechEntryRepository],
  controllers: [TechLibraryController],
  exports: [TechLibraryService],
})
export class TechLibraryModule {}
