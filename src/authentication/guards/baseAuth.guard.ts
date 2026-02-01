import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthClientService, AuthUser } from "../services/auth-client.service";

@Injectable()
export abstract class BaseAuthGuard implements CanActivate {
    constructor(
        protected readonly jwtService: JwtService,
        protected readonly authClientService: AuthClientService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Get token from cookies or headers
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException("No token provided");
        }

        try {
            // Verify token
            const payload = this.jwtService.verify(token);

            // Get fresh user data from auth service
            const user = await this.authClientService.getUserById(
                payload.userId,
            );

            if (!user) {
                throw new UnauthorizedException("User not found");
            }

            // Attach user to request
            request.user = user;

            // Allow subclasses to perform additional validation
            return await this.additionalValidation(request, user, context);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new UnauthorizedException("Token expired");
            }
            throw new UnauthorizedException(
                "Error encountered: " + error.message,
            );
        }
    }

    /**
     * Extract token from request cookies or headers
     */
    protected extractToken(request: any): string {
        return request.cookies["auth-token"];
    }

    /**
     * Override this method in subclasses to add additional validation logic
     * @param request The HTTP request object
     * @param user The authenticated user
     * @param context The execution context
     * @returns true if validation passes, false otherwise
     */
    protected async additionalValidation(
        request: any,
        user: AuthUser,
        context: ExecutionContext,
    ): Promise<boolean> {
        // Default implementation: no additional validation
        return true;
    }
}

