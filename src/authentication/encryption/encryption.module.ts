import { Module } from "@nestjs/common";
import { EncryptionService } from "./encryption.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [EncryptionService],
    exports: [EncryptionService],
})
export class EncryptionModule {}