import { Injectable } from "@nestjs/common";
import { BaseAuthGuard } from "./baseAuth.guard";

/**
 * Basic StartGG authentication guard that validates JWT token and user existence.
 * Does not check roles or tournament series access.
 * Use this for endpoints that only require user authentication.
 */
@Injectable()
export class BasicStartggAuthGuard extends BaseAuthGuard {

}
