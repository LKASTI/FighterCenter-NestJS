import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy, AuthClientService } from "@fgclegends/fightercenter-shared-nestjs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SeriesAuthGuard } from "./guards/seriesAuth.guard";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        ConfigModule.forRoot(), // loads environment variables
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const expirationDuration = parseInt(configService.get<string>("JWT_EXPIRATION_DURATION") || "900"); // 15 minutes
                return {
                    secret: configService.get<string>("JWT_SECRET"),
                    signOptions: {
                        expiresIn: expirationDuration,
                    },
                };
            },
        }),
        HttpModule,
    ],
    providers: [
        // Services
        AuthClientService,
        // Strategies
        JwtStrategy,
        // Guards
        SeriesAuthGuard
    ],
    controllers: [],
    exports: [JwtModule, SeriesAuthGuard, AuthClientService],
})
export class AuthModule {}
