import { Module } from '@nestjs/common';
import { FileNamingService } from './services/file-naming.service';

@Module({
  providers: [FileNamingService],
  exports: [FileNamingService],
})
export class CommonModule {}
