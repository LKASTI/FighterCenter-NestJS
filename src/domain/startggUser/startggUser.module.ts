import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StartggUser } from "src/domain/entities/startggUser.entity";
import { StartggUserRepository } from "src/domain/startggUser/startggUser.repository";
import { StartggUserService } from "src/domain/startggUser/startggUser.service";
import { EncryptionModule } from "../../authentication/encryption/encryption.module";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [TypeOrmModule.forFeature([StartggUser]), EncryptionModule, HttpModule],
    providers: [StartggUserService, StartggUserRepository],
    exports: [StartggUserService],
})
export class StartggUserModule {}
