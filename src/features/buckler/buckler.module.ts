import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SF6BucklerConfig } from "./entities/sf6BucklerConfig.entity";
import { BucklerConfigService } from "./services/buckler-config.service";
import { BucklerAuthService } from "./services/buckler-auth.service";
import { BucklerHttpService } from "./services/buckler-http.service";
import { BucklerNotificationService } from "./services/buckler-notification.service";
import { BucklerConfigController } from "./controllers/buckler-config.controller";
import { AuthModule } from "@authentication/auth.module";

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([SF6BucklerConfig]),
        AuthModule,
    ],
    providers: [
        BucklerConfigService,
        BucklerAuthService,
        BucklerHttpService,
        BucklerNotificationService,
    ],
    controllers: [BucklerConfigController],
    exports: [
        BucklerConfigService,
        BucklerAuthService,
        BucklerHttpService,
        BucklerNotificationService,
    ],
})
export class BucklerModule {}
