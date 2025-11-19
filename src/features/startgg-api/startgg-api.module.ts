import { Module } from "@nestjs/common";
import { StartggApiService } from "./services/startgg-api.service";
import { StartggApiController } from "./controllers/startgg-api.controller";
import { EncryptionModule } from "@authentication/encryption/encryption.module";

@Module({
    imports: [
        EncryptionModule
    ],
    providers: [StartggApiService],
    controllers: [StartggApiController],
    exports: [StartggApiService],
})
export class StartggApiModule {}
