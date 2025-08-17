import { Module } from "@nestjs/common";
import { StartggApiService } from "./startggApi.service";
import { StartggApiController } from "../../controllers/startggApi.controller";
import { EncryptionModule } from "../../authentication/encryption/encryption.module";

@Module({
    imports: [
        EncryptionModule
    ],
    providers: [StartggApiService],
    controllers: [StartggApiController],
    exports: [StartggApiService],
})
export class StartggApiModule {}
