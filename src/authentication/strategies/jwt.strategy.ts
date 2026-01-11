import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.["auth-token"] || null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        return {
            id: payload.sub,
            startggUserID: payload.startggUserID, // UUID for database foreign keys
            username: payload.username,
            gamerTag: payload.gamerTag,
            roles: payload.roles,
            tournamentSeriesAssigned: payload.tournamentSeriesAssigned,
        };
    }
}
