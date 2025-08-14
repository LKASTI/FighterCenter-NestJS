import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { StartggApiService } from "./startggApi.service";
import { StartggApiController } from "../../controllers/startggApi.controller";

@Module({
    imports: [
        HttpModule,
    ],
    providers: [StartggApiService],
    controllers: [StartggApiController],
    exports: [StartggApiService],
})
export class StartggApiModule {}
