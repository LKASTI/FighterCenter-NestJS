import { ApiCookieAuth, ApiParam } from "@nestjs/swagger";
import { createApiDecorator, StandardResponses, JwtAuthGuard } from "@fgclegends/fightercenter-shared-nestjs";

/**
 * Composed decorator for tech library POST endpoints (sync/upload)
 * Includes authentication, standard responses, and operation documentation
 */
export function ApiTechLibraryPost(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: JwtAuthGuard,
        responses: [
            StandardResponses.created("Success", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.invalidInput("Invalid tech library data"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}

/**
 * Composed decorator for tech library GET endpoints
 * Includes authentication, standard responses, and operation documentation
 */
export function ApiTechLibraryGet(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: JwtAuthGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.notFound("Tech library"),
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}

/**
 * Composed decorator for tech library DELETE endpoints
 * Includes authentication and standard responses
 */
export function ApiTechLibraryDelete(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: JwtAuthGuard,
        responses: [
            StandardResponses.success("Tech library deleted successfully", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.notFound("Tech library"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}

/**
 * Composed decorator for shared tech entry endpoints (POST)
 * Used for creating shared entries
 */
export function ApiSharedTechPost(summary: string, responseType?: any) {
    return createApiDecorator({
        isDisabled: true,
        excludeFromSwagger: true,
        summary,
        guard: JwtAuthGuard,
        responses: [
            StandardResponses.created("Shared entry created successfully", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.invalidInput("Invalid entry data"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}

/**
 * Composed decorator for public shared tech entry GET endpoints
 * No authentication required - public access
 */
export function ApiSharedTechPublicGet(summary: string, responseType?: any) {
    return createApiDecorator({
        isDisabled: true,
        excludeFromSwagger: true,
        summary,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.notFound("Shared entry"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiParam({
                name: "shareCode",
                description: "Unique share code for the tech entry",
                required: true,
            }),
        ],
    });
}

/**
 * Composed decorator for authenticated shared tech entry GET endpoints
 * Includes authentication for listing user's shared entries
 */
export function ApiSharedTechGet(summary: string, responseType?: any) {
    return createApiDecorator({
        isDisabled: true,
        excludeFromSwagger: true,
        summary,
        guard: JwtAuthGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}

/**
 * Composed decorator for shared tech entry DELETE endpoints
 * Includes authentication
 */
export function ApiSharedTechDelete(summary: string, responseType?: any) {
    return createApiDecorator({
        isDisabled: true,
        excludeFromSwagger: true,
        summary,
        guard: JwtAuthGuard,
        responses: [
            StandardResponses.success("Shared entry deleted successfully", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.notFound("Shared entry"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiCookieAuth("auth-token"),
        ],
    });
}
