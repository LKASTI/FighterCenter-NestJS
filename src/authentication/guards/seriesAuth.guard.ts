import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { StartggUserService } from "../../domain/startggUser/startggUser.service";
import { StartggRefreshTokenResponse } from "../../domain/startggUser/startggUser.interfaces";

@Injectable()
export class SeriesAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        private readonly startggUserService: StartggUserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        // Get the required roles from controller decorator Roles()
        const requiredRoles = this.reflector.get<string[]>(
            "roles",
            context.getHandler(),
        );

        // Get token from cookies
        let token = "";
        if (process.env.NODE_ENV === "production") {
            token = request.cookies["auth-token"];
        } else if (process.env.NODE_ENV === "development") {
            console.log("Request headers/cookies: ");
            console.log(request.headers);
            console.log(request.cookies);
            const authToken = request.headers["x-auth-token"] as string;
            if(!authToken) {
                throw new UnauthorizedException("No auth token provided in headers");
            }
            token = authToken.startsWith("Bearer ")
                ? authToken.slice(7)
                : authToken;
        }

        if (!token) {
            throw new UnauthorizedException("No token provided");
        }

        try {
            //TODO: THOROUGHLY TEST THIS GUARD

            // Verify token
            const payload = this.jwtService.verify(token);

            // Get roles and assigned tournament serieses from user service
            const user = await this.startggUserService.findByStartggId(
                payload.sub,
            );

            if (!user) {
                throw new UnauthorizedException("User not found");
            }

            // TODO check if token expired
            if(Date.now() >= user.startggTokenExpiresIn) {
                const res: StartggRefreshTokenResponse = await this.startggUserService.refreshStartggToken(user.startggEncryptedRefreshToken, user.startggUserID);
                user.startggEncryptedRefreshToken = res.encryptedRefreshToken;
                user.startggTokenExpiresIn = res.expiresIn;
                user.startggEncryptedToken = res.encryptedAccessToken;
            }


            //TODO
            const userRoles = user.roles || [];
            const userTournamentSeriesAssigned =
                user.tournamentSeriesAssigned || [];

            // Verify if approved user role is present
            if (requiredRoles && requiredRoles.length > 0) {
                const hasRole = requiredRoles.some((role) =>
                    userRoles.includes(role),
                );
                if (!hasRole) {
                    throw new ForbiddenException("Insufficient permissions");
                }
            }

            // SUPER_ADMIN can access all series
            if (!userRoles.includes("SUPER_ADMIN")) {
                // Verify if user has access to the series
                const seriesId = request.params.tournamentSeriesId;
                if (seriesId) {
                    const hasAccessToSeries =
                        userTournamentSeriesAssigned.includes(seriesId);
                    if (!hasAccessToSeries) {
                        throw new ForbiddenException(
                            "You do not have access to this tournament series",
                        );
                    }
                }
            }

            console.log("series auth guard passed");
            request.user = user;
            return true;
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new UnauthorizedException("Token expired");
            }
            throw new UnauthorizedException("Error encountered: ", error);
        }
    }
}