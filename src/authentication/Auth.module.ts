import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TournamentDataParserModule } from "../features/tournamentImporter/TournamentDataParser.module";
import { StartggUserModule } from "../domain/startggUser/startggUser.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "../controllers/Auth.controller";
import { StartGGStrategy } from "./strategies/startgg.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        StartggUserModule,
        TournamentDataParserModule,

        PassportModule.register({ defaultStrategy: "jwt" }),
        ConfigModule.forRoot(), // Make sure this is included to load environment variables
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: {
                    expiresIn: parseInt(
                        configService.get<string>("COOKIE_EXPIRATION_DURATION"),
                    ), // Match your cookie expiration
                },
            }),
        }),

        HttpModule,
    ],
    providers: [
        // Strategies
        StartGGStrategy,
        JwtStrategy,
    ],
    controllers: [AuthController],
    exports: [JwtModule],
})
export class AuthModule {}
