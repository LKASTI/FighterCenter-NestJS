import { Module } from "@nestjs/common";
import { TwitterShareService } from "./twitterShare.service";
import { TwitterShareController } from "../../controllers/twitterShare.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TwitterShare } from "../../domain/entities/twitterShare.entity";
import { TwitterShareRepository } from "./twitterShare.repository";
import { R2UploadService } from "./r2/r2-upload.service";

@Module({
    imports: [TypeOrmModule.forFeature([TwitterShare])],
    providers: [TwitterShareService, TwitterShareRepository, R2UploadService],
    controllers: [TwitterShareController],
    exports: [TwitterShareService],
})
export class TwitterShareModule {}