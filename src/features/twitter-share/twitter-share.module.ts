import { Module } from "@nestjs/common";
import { TwitterShareService } from "./services/twitter-share.service";
import { TwitterShareController } from "./controllers/twitter-share.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TwitterShare } from "@domain/entities/twitterShare.entity";
import { TwitterShareRepository } from "./repositories/twitter-share.repository";
import { CommonModule } from "@common/common.module";

@Module({
    imports: [TypeOrmModule.forFeature([TwitterShare]), CommonModule],
    providers: [TwitterShareService, TwitterShareRepository],
    controllers: [TwitterShareController],
    exports: [TwitterShareService],
})
export class TwitterShareModule {}
