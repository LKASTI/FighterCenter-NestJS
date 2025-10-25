import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { StartggUserService } from "../../domain/startggUser/startggUser.service";
import { StartggRefreshTokenResponse } from "../../domain/startggUser/startggUser.interfaces";
import { StartggUser } from "../../domain/entities";

@Injectable()
export abstract class BaseAuthGuard implements CanActivate {
    constructor(
        protected readonly jwtService: JwtService,
        protected readonly startggUserService: StartggUserService,
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

            // Get user from service
            const user = await this.startggUserService.findByStartggId(
                payload.sub,
            );

            if (!user) {
                throw new UnauthorizedException("User not found");
            }

            // Check if token expired and refresh if needed
            if (Date.now() >= user.startggTokenExpiresIn) {
                const res: StartggRefreshTokenResponse = await this.startggUserService.refreshStartggToken(
                    user.startggEncryptedRefreshToken,
                    user.startggUserID
                );
                user.startggEncryptedRefreshToken = res.encryptedRefreshToken;
                user.startggTokenExpiresIn = res.expiresIn;
                user.startggEncryptedToken = res.encryptedAccessToken;
            }

            // Attach user to request
            request.user = user;

            // Allow subclasses to perform additional validation
            return await this.additionalValidation(request, user, context);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new UnauthorizedException("Token expired");
            }
            throw new UnauthorizedException("Error encountered: " + error.message);
        }
    }

    /**
     * Extract token from request cookies or headers
     */
    protected extractToken(request: any): string {
        let token = "";

        if (process.env.NODE_ENV === "production") {
            token = request.cookies["auth-token"];
        } else if (process.env.NODE_ENV === "development") {
            console.log("Request headers/cookies: ");
            console.log(request.headers);
            console.log(request.cookies);
            const authToken = request.headers["x-auth-token"] as string;
            if (!authToken) {
                throw new UnauthorizedException("No auth token provided in headers");
            }
            token = authToken.startsWith("Bearer ")
                ? authToken.slice(7)
                : authToken;
        }

        return token;
    }

    /**
     * Override this method in subclasses to add additional validation logic
     * @param request The HTTP request object
     * @param user The authenticated StartGG user
     * @param context The execution context
     * @returns true if validation passes, false otherwise
     */
    protected async additionalValidation(
        request: any,
        user: StartggUser,
        context: ExecutionContext
    ): Promise<boolean> {
        // Default implementation: no additional validation
        return true;
    }
}
