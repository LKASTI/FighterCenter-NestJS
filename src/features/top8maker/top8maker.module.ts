import { Module } from "@nestjs/common";
import { EncryptionModule } from "../../authentication/encryption/encryption.module";
import { Top8MakerService } from "./top8maker.service";
import { Top8makerController } from "../../controllers/top8maker.controller";

@Module({
    imports: [
        EncryptionModule
    ],
    providers: [Top8MakerService],
    controllers: [Top8makerController],
    exports: [Top8MakerService],
})
export class Top8MakerModule {}
