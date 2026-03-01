import { ApiBearerAuth } from "@nestjs/swagger";
import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";
import { SupabaseJwtAuthGuard } from "../../../authentication/guards/supabase-jwt-auth.guard";

/**
 * Composed decorator for note book POST endpoints (sync/upload)
 * Includes authentication, standard responses, and operation documentation
 */
export function ApiNoteBookPost(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: SupabaseJwtAuthGuard,
        responses: [
            StandardResponses.created("Success", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.invalidInput("Invalid notes data"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiBearerAuth("bearer"),
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
        guard: SupabaseJwtAuthGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.notFound("Notes"),
        ],
        additionalDecorators: [
            ApiBearerAuth("bearer"),
        ],
    });
}

/**
 * Composed decorator for note book DELETE endpoints
 * Includes authentication and standard responses
 */
export function ApiNoteBookDelete(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: SupabaseJwtAuthGuard,
        responses: [
            StandardResponses.success("Notes deleted successfully", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.notFound("Notes"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiBearerAuth("bearer"),
        ],
    });
}
