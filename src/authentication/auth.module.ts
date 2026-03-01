import { Module } from "@nestjs/common";
import { HttpModule, HttpService } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import {
    AuthClientService,
} from "@fgclegends/fightercenter-shared-nestjs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SeriesAuthGuard } from "./guards/seriesAuth.guard";
import { SupabaseJwtStrategy } from "./supabase-jwt.strategy";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "supabase-jwt" }),
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
        // Shared providers via explicit injection (npm link-safe)
        {
            provide: AuthClientService,
            useFactory: (
                httpService: HttpService,
                configService: ConfigService,
            ) =>
                new (AuthClientService as any)(
                    httpService as any,
                    configService as any,
                ),
            inject: [HttpService, ConfigService],
        },
        {
            provide: SupabaseJwtStrategy,
            useFactory: (configService: ConfigService) =>
                new (SupabaseJwtStrategy as any)(configService as any),
            inject: [ConfigService],
        },
        // Guards
        SeriesAuthGuard
    ],
    controllers: [],
    exports: [JwtModule, SeriesAuthGuard, AuthClientService],
})
export class AuthModule {}
