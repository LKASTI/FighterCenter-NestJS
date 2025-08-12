import { Module } from "@nestjs/common";
import { TwitterShareService } from "./twitterShare.service";
import { TwitterShareController } from "../../controllers/twitterShare.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TwitterShare } from "../entities/twitterShare.entity";
import { TwitterShareRepository } from "./twitterShare.repository";

@Module({
    imports: [TypeOrmModule.forFeature([TwitterShare])],
    providers: [TwitterShareService, TwitterShareRepository],
    controllers: [TwitterShareController],
    exports: [TwitterShareService],
})
export class TwitterShareModule {}