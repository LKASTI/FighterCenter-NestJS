import { Module } from "@nestjs/common";
import { EncryptionModule } from "@authentication/encryption/encryption.module";
import { Top8MakerService } from "./services/top8-maker.service";
import { Top8MakerController } from "./controllers/top8-maker.controller";
import { StartggApiModule } from "@features/startgg-api";
import { AuthModule } from "@authentication/auth.module";

@Module({
    imports: [
        EncryptionModule,
        StartggApiModule,
        AuthModule
    ],
    providers: [Top8MakerService],
    controllers: [Top8MakerController],
    exports: [Top8MakerService],
})
export class Top8MakerModule {}
