import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    canActivate(context: ExecutionContext) {
        console.log("JwtAuthGuard - canActivate called");
        const request = context.switchToHttp().getRequest();
        console.log(
            "JwtAuthGuard - Cookie present:",
            Object.entries(request.cookies),
        );

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        console.log("JwtAuthGuard - handleRequest called");
        console.log("JwtAuthGuard - Error:", err);
        console.log("JwtAuthGuard - User:", user);
        console.log("JwtAuthGuard - Info:", info);

        if (err || !user) {
            console.log("JwtAuthGuard - Authentication failed", err);
            throw err || new UnauthorizedException("Authentication failed");
        }
        return user;
    }
}