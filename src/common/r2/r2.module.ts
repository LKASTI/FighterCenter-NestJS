import { Module } from '@nestjs/common';
import { R2ImagesService } from './r2-images.service';
import { R2TierlistService } from './r2-tierlist.service';

@Module({
    providers: [R2ImagesService, R2TierlistService],
    exports: [R2ImagesService, R2TierlistService],
})
export class R2Module {}
