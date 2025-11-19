import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "@decorators/endpoint-status-toggles";

export function ApiRankedParserPost(
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
            status: 201,
            description: "Data parsed and stored successfully",
            type: responseType
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - invalid file or parameters"
        }),
        ApiResponse({
            status: 404,
            description: "File or directory not found"
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
