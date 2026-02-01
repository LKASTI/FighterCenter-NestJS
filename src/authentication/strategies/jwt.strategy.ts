import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.["auth-token"] || null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_SECRET"),
        });
    }

    async validate(payload: any) {
        if (!payload.sub || !payload.userId) {
            throw new UnauthorizedException("Invalid token payload");
        }

        // Return minimal user object - guards will call auth service if they need more
        return {
            userId: payload.userId,
            startggId: payload.startggId,
            googleId: payload.googleId,
            startggSlug: payload.startggSlug,
            startggDiscriminator: payload.startggDiscriminator,
            roles: payload.roles || [],
            tournamentSeriesAssigned: payload.tournamentSeriesAssigned || [],
        };
    }
}
