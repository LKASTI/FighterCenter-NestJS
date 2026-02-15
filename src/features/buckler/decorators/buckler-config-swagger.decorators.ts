import { ApiCookieAuth } from "@nestjs/swagger";
import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";
import { SeriesAuthGuard } from "@authentication/guards/seriesAuth.guard";

/**
 * Composed decorator for buckler config GET endpoints
 * Requires SUPER_ADMIN role via SeriesAuthGuard + @Roles
 */
export function ApiBucklerConfigGet(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: SeriesAuthGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            { status: 401, description: "User not authenticated" },
            { status: 403, description: "Insufficient permissions - SUPER_ADMIN required" },
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}

/**
 * Composed decorator for buckler config PATCH endpoints
 * Requires SUPER_ADMIN role via SeriesAuthGuard + @Roles
 */
export function ApiBucklerConfigPatch(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: SeriesAuthGuard,
        responses: [
            StandardResponses.success("Config updated", responseType),
            { status: 401, description: "User not authenticated" },
            { status: 403, description: "Insufficient permissions - SUPER_ADMIN required" },
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}
