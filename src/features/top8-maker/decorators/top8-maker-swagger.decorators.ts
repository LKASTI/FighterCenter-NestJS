import { ApiSecurity, ApiQuery } from "@nestjs/swagger";
import { SeriesAuthGuard } from "@authentication/guards/seriesAuth.guard";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiTop8MakerGet(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: SeriesAuthGuard,
        responses: [
            { status: 200, description: "Success - Returns top 8 player data", type: responseType },
            { status: 401, description: "Unauthorized - invalid or missing auth token" },
            StandardResponses.forbidden(),
            StandardResponses.notFound("Event"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiSecurity('x-auth-token'),
            ApiQuery({
                name: 'slug',
                description: 'Event slug from Start.gg (e.g., "tournament-slug/event/event-slug")',
                required: true,
                type: String
            }),
        ],
    });
}
