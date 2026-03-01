import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";
import { SupabaseJwtAuthGuard } from "../../../authentication/guards/supabase-jwt-auth.guard";

/**
 * Composed decorator for subscription POST endpoints (checkout, cancel, resume)
 * Includes authentication, standard responses, and operation documentation
 */
export function ApiSubscriptionPost(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: SupabaseJwtAuthGuard,
        responses: [
            StandardResponses.created("Success", responseType),
            { status: 401, description: "User not authenticated" },
            StandardResponses.notFound("Subscription"),
        ],
        additionalDecorators: [
            ApiBearerAuth("bearer"),
        ],
    });
}

/**
 * Composed decorator for subscription GET endpoints with optional productType query
 * Includes authentication, query parameter documentation, and standard responses
 */
export function ApiSubscriptionGet(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: SupabaseJwtAuthGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            { status: 401, description: "User not authenticated" },
        ],
        additionalDecorators: [
            ApiBearerAuth("bearer"),
            ApiQuery({
                name: "productType",
                required: false,
                enum: ["ad_free"],
                description: "Type of subscription product (defaults to ad_free)",
            }),
        ],
    });
}

/**
 * Composed decorator for subscription POST endpoints with optional productType query
 * Used for cancel and resume operations that accept query parameters
 */
export function ApiSubscriptionPostWithQuery(
    summary: string,
    responseType?: any,
) {
    return createApiDecorator({
        summary,
        guard: SupabaseJwtAuthGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            { status: 401, description: "User not authenticated" },
            StandardResponses.notFound("Subscription"),
        ],
        additionalDecorators: [
            ApiBearerAuth("bearer"),
            ApiQuery({
                name: "productType",
                required: false,
                enum: ["ad_free"],
                description: "Type of subscription product (defaults to ad_free)",
            }),
        ],
    });
}
