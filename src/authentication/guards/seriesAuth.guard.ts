import {
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import {
    AuthClientService,
    AuthUser,
} from "@fgclegends/fightercenter-shared-nestjs";

@Injectable()
export class SeriesAuthGuard extends AuthGuard("supabase-jwt") {
    constructor(
        private readonly reflector: Reflector,
        private readonly authClientService: AuthClientService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const activated = (await super.canActivate(context)) as boolean;
        if (!activated) return false;

        const request = context.switchToHttp().getRequest();
        const principal = request.user;

        if (!principal) {
            throw new UnauthorizedException("Authentication failed");
        }

        let user: AuthUser | null = null;
        if (principal.supabaseUserId) {
            user = await this.authClientService.getUserBySupabaseId(
                principal.supabaseUserId,
            );
        } else if (principal.userId) {
            user = await this.authClientService.getUserById(principal.userId);
        }

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        request.user = user;

        const requiredRoles = this.reflector.get<string[]>(
            "roles",
            context.getHandler(),
        );

        const userRoles = user.roles || [];
        const userTournamentSeriesAssigned = user.tournamentSeriesAssigned || [];

        if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = requiredRoles.some((role) => userRoles.includes(role));
            if (!hasRole) {
                throw new ForbiddenException("Insufficient permissions");
            }
        }

        if (!userRoles.includes("SUPER_ADMIN")) {
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

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            throw err || new UnauthorizedException("Authentication failed");
        }
        return user;
    }
}
