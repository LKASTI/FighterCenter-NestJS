import { ApiBearerAuth } from "@nestjs/swagger";
import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";
import { SeriesAuthGuard } from "@authentication/guards/seriesAuth.guard";

/**
 * Composed decorator for ranked scraper POST endpoints
 * Requires SUPER_ADMIN role via SeriesAuthGuard + @Roles
 */
export function ApiRankedScraperPost(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: SeriesAuthGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            { status: 401, description: "User not authenticated" },
            { status: 403, description: "Insufficient permissions - SUPER_ADMIN required" },
            { status: 502, description: "Buckler request failed (cookie expiry or connection error)" },
        ],
        additionalDecorators: [
            ApiBearerAuth("bearer"),
        ],
    });
}
