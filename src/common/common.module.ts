import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { FileNamingService } from './services/file-naming.service';
import { TaggedCacheService } from "@fgclegends/fightercenter-shared-nestjs";

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // Default 5 minutes (in milliseconds)
      max: 1000, // Max 1000 items in cache
    }),
  ],
  providers: [FileNamingService, TaggedCacheService],
  exports: [FileNamingService, TaggedCacheService],
})
export class CommonModule {}
