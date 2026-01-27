import { ApiCookieAuth } from "@nestjs/swagger";
import { createApiDecorator, StandardResponses } from "@common/decorators";
import { JwtAuthGuard } from "@authentication/guards/jwtAuth.guard";

/**
 * Composed decorator for note book POST endpoints (sync/upload)
 * Includes authentication, standard responses, and operation documentation
 */
export function ApiNoteBookPost(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: JwtAuthGuard,
        responses: [
            StandardResponses.created("Success", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.invalidInput("Invalid notes data"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}

/**
 * Composed decorator for note book GET endpoints
 * Includes authentication, standard responses, and operation documentation
 */
export function ApiNoteBookGet(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: JwtAuthGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.notFound("Notes"),
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}

/**
 * Composed decorator for note book DELETE endpoints
 * Includes authentication and standard responses
 */
export function ApiNoteBookDelete(summary: string) {
    return createApiDecorator({
        summary,
        guard: JwtAuthGuard,
        responses: [
            StandardResponses.deleted("Notes deleted successfully"),
            StandardResponses.unauthorized(),
            StandardResponses.notFound("Notes"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}
