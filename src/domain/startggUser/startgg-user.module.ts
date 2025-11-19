import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StartggUser } from "@entities/startggUser.entity";
import { StartggUserRepository } from "./repositories/startgg-user.repository";
import { StartggUserService } from "./services/startgg-user.service";
import { StartggUserController } from "./controllers/startgg-user.controller";
import { EncryptionModule } from "@authentication/encryption/encryption.module";
import { HttpModule } from "@nestjs/axios";
import { BasicStartggAuthGuard } from "@authentication/guards/basicStartggAuth.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([StartggUser]),
        EncryptionModule,
        HttpModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: { expiresIn: "7d" },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [StartggUserService, StartggUserRepository, BasicStartggAuthGuard],
    controllers: [StartggUserController],
    exports: [StartggUserService],
})
export class StartggUserModule {}
