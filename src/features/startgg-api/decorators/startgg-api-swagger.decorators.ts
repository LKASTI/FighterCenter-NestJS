import { applyDecorators, UseGuards } from "@nestjs/common";
import {
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam
} from "@nestjs/swagger";
import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "@decorators/endpoint-status-toggles";

export function ApiStartggGet(
    summary: string,
    responseType?: any,
    isDisabled: boolean = false
) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({
            status: 200,
            description: "Success",
            type: responseType
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - invalid parameters"
        }),
        ApiResponse({
            status: 401,
            description: "Unauthorized - no valid Start.gg token"
        }),
        ApiResponse({
            status: 429,
            description: "Rate limit exceeded"
        }),
        ApiResponse({
            status: 500,
            description: "Internal server error"
        }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiStartggGetWithQuery(
    summary: string,
    queryName: string,
    queryDescription: string,
    responseType?: any,
    isDisabled: boolean = false
) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiQuery({
            name: queryName,
            description: queryDescription,
            required: true,
            type: String
        }),
        ApiResponse({
            status: 200,
            description: "Success",
            type: responseType
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - invalid parameters"
        }),
        ApiResponse({
            status: 401,
            description: "Unauthorized - no valid Start.gg token"
        }),
        ApiResponse({
            status: 429,
            description: "Rate limit exceeded"
        }),
        ApiResponse({
            status: 500,
            description: "Internal server error"
        }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiStartggGetWithParam(
    summary: string,
    paramName: string,
    paramDescription: string,
    responseType?: any,
    isDisabled: boolean = false
) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiParam({
            name: paramName,
            description: paramDescription,
            required: true,
            type: String
        }),
        ApiResponse({
            status: 200,
            description: "Success",
            type: responseType
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - invalid parameters"
        }),
        ApiResponse({
            status: 401,
            description: "Unauthorized - no valid Start.gg token"
        }),
        ApiResponse({
            status: 429,
            description: "Rate limit exceeded"
        }),
        ApiResponse({
            status: 500,
            description: "Internal server error"
        }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}
