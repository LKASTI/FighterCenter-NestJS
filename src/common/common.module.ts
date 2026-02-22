import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { FileNamingService } from './services/file-naming.service';
import { TaggedCacheService } from "@fgclegends/fightercenter-shared-nestjs";
import { R2Module } from './r2/r2.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // Default 5 minutes (in milliseconds)
      max: 1000, // Max 1000 items in cache
    }),
    R2Module,
  ],
  providers: [FileNamingService, TaggedCacheService],
  exports: [FileNamingService, TaggedCacheService, R2Module],
})
export class CommonModule {}
