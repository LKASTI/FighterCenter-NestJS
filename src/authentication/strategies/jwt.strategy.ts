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
                    // use cookies in production, headers in development
                    if (process.env.NODE_ENV === "production") {
                        return request?.cookies?.["auth-token"];
                    } else if (process.env.NODE_ENV === "development") {
                        const authToken = request.headers[
                            "x-auth-token"
                        ] as string;
                        if (authToken) {
                            return authToken.startsWith("Bearer ")
                                ? authToken.slice(7)
                                : authToken;
                        }
                    }
                    return "";
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        return {
            id: payload.sub,
            username: payload.username,
            gamerTag: payload.gamerTag,
            roles: payload.roles,
            tournamentSeriesAssigned: payload.tournamentSeriesAssigned,
        };
    }
}
