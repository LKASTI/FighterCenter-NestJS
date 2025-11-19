import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TournamentDataParserModule } from "@features/tournament-importer";
import { StartggUserModule } from "../domain/startggUser/startggUser.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "../controllers/auth.controller";
import { StartGGStrategy } from "./strategies/startgg.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EncryptionModule } from "./encryption/encryption.module";
import { SeriesAuthGuard } from "./guards/seriesAuth.guard";
import { JwtRefreshTokenModule } from "../domain/jwtRefreshToken/jwtRefreshToken.module";

@Module({
    imports: [
        StartggUserModule,
        TournamentDataParserModule,
        EncryptionModule,
        JwtRefreshTokenModule,

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
        // Strategies
        StartGGStrategy,
        JwtStrategy,
        // Guards
        SeriesAuthGuard
    ],
    controllers: [AuthController],
    exports: [JwtModule, SeriesAuthGuard, StartggUserModule],
})
export class AuthModule {}
