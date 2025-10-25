import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { StartggUserService } from "../../domain/startggUser/startggUser.service";
import { BaseAuthGuard } from "./baseAuth.guard";
import { StartggUser } from "../../domain/entities";

@Injectable()
export class SeriesAuthGuard extends BaseAuthGuard {
    constructor(
        protected readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        protected readonly startggUserService: StartggUserService,
    ) {
        super(jwtService, startggUserService);
    }

    /**
     * Additional validation for role and tournament series access
     */
    protected async additionalValidation(
        request: any,
        user: StartggUser,
        context: ExecutionContext
    ): Promise<boolean> {
        // Get the required roles from controller decorator Roles()
        const requiredRoles = this.reflector.get<string[]>(
            "roles",
            context.getHandler(),
        );

        const userRoles = user.roles || [];
        const userTournamentSeriesAssigned = user.tournamentSeriesAssigned || [];

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
        return true;
    }
}