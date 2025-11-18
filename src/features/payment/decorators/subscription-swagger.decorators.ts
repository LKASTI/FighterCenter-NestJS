import { applyDecorators, UseGuards } from "@nestjs/common";
import {
    ApiOperation,
    ApiResponse,
    ApiCookieAuth,
    ApiQuery,
} from "@nestjs/swagger";
import { BasicStartggAuthGuard } from "../../../authentication/guards/basicStartggAuth.guard";

/**
 * Composed decorator for subscription POST endpoints (checkout, cancel, resume)
 * Includes authentication, standard responses, and operation documentation
 */
export function ApiSubscriptionPost(summary: string, responseType?: any) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiCookieAuth("auth-token"),
        UseGuards(BasicStartggAuthGuard),
        ApiResponse({
            status: 201,
            description: "Success",
            type: responseType,
        }),
        ApiResponse({
            status: 401,
            description: "User not authenticated",
        }),
        ApiResponse({
            status: 404,
            description: "Subscription not found",
        }),
    );
}

/**
 * Composed decorator for subscription GET endpoints with optional productType query
 * Includes authentication, query parameter documentation, and standard responses
 */
export function ApiSubscriptionGet(summary: string, responseType?: any) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiCookieAuth("auth-token"),
        UseGuards(BasicStartggAuthGuard),
        ApiQuery({
            name: "productType",
            required: false,
            enum: ["ad_free"],
            description:
                "Type of subscription product (defaults to ad_free)",
        }),
        ApiResponse({
            status: 200,
            description: "Success",
            type: responseType,
        }),
        ApiResponse({
            status: 401,
            description: "User not authenticated",
        }),
    );
}

/**
 * Composed decorator for subscription POST endpoints with optional productType query
 * Used for cancel and resume operations that accept query parameters
 */
export function ApiSubscriptionPostWithQuery(
    summary: string,
    responseType?: any,
) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiCookieAuth("auth-token"),
        UseGuards(BasicStartggAuthGuard),
        ApiQuery({
            name: "productType",
            required: false,
            enum: ["ad_free"],
            description:
                "Type of subscription product (defaults to ad_free)",
        }),
        ApiResponse({
            status: 200,
            description: "Success",
            type: responseType,
        }),
        ApiResponse({
            status: 401,
            description: "User not authenticated",
        }),
        ApiResponse({
            status: 404,
            description: "Subscription not found",
        }),
    );
}
