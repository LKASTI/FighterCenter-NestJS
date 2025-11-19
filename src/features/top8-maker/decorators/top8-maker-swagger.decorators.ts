import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from "@nestjs/swagger";
import { SeriesAuthGuard } from "@authentication/guards/seriesAuth.guard";

export function ApiTop8MakerGet(summary: string, responseType?: any) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiSecurity('x-auth-token'),
        UseGuards(SeriesAuthGuard),
        ApiQuery({
            name: 'slug',
            description: 'Event slug from Start.gg (e.g., "tournament-slug/event/event-slug")',
            required: true,
            type: String
        }),
        ApiResponse({
            status: 200,
            description: "Success - Returns top 8 player data",
            type: responseType
        }),
        ApiResponse({
            status: 401,
            description: "Unauthorized - invalid or missing auth token"
        }),
        ApiResponse({
            status: 403,
            description: "Forbidden - insufficient permissions"
        }),
        ApiResponse({
            status: 404,
            description: "Event not found"
        }),
        ApiResponse({
            status: 500,
            description: "Internal server error"
        }),
    );
}
