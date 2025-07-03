import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { Reflector} from "@nestjs/core";
import { StartggUserService } from "../../domain/startggUser/startggUser.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        console.log('JwtAuthGuard - canActivate called');
        const request = context.switchToHttp().getRequest();
        console.log('JwtAuthGuard - Cookie present:', !!request.cookies);

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        console.log('JwtAuthGuard - handleRequest called');
        console.log('JwtAuthGuard - Error:', err);
        console.log('JwtAuthGuard - User:', user);
        console.log('JwtAuthGuard - Info:', info);

        if (err || !user) {
            console.log('JwtAuthGuard - Authentication failed', err);
            throw err || new UnauthorizedException('Authentication failed');
        }
        return user;
    }
}

@Injectable()
export class SeriesAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
		private readonly StartggUserService: StartggUserService,
	) {	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		// Get the required roles from controller decorator Roles()
		const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

		// Get token from cookies
		const token = request.cookies['auth-token'];

		if (!token) {
			throw new UnauthorizedException('No token provided');
		}

		try {
			//TODO: THOROUGHLY TEST THIS GUARD

			// Verify token
			const payload = this.jwtService.verify(token);

			// Get roles and assigned tournament serieses from user service
			const user = await this.StartggUserService.findByStartggId(payload.sub);
			if (!user) {
				throw new UnauthorizedException('User not found');
			}
			const userRoles = user.roles || [];
			const userTournamentSeriesAssigned = user.tournamentSeriesAssigned || [];

			// Verify if approved user role is present
			if (requiredRoles && requiredRoles.length > 0) {
				const hasRole = requiredRoles.some(role => userRoles.includes(role));
				if (!hasRole) {
					throw new ForbiddenException('Insufficient permissions');
				}
			}

			// SUPER_ADMIN can access all series
			if(!userRoles.includes('SUPER_ADMIN')) {
				// Verify if user has access to the series
				const seriesId = request.params.tournamentSeriesId;
				if(seriesId) {
					const hasAccessToSeries = userTournamentSeriesAssigned.includes(seriesId);
					if(!hasAccessToSeries) {
						throw new ForbiddenException('You do not have access to this tournament series');
					}
				}
			}

            console.log('series auth guard passed')
			request.user = payload;
			return true;
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				throw new UnauthorizedException('Token expired');
			}
			throw new UnauthorizedException('Invalid token');
		}
	}
}