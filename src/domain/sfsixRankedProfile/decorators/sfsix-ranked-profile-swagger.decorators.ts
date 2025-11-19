import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "@decorators/endpoint-status-toggles";

export function ApiSFSixRankedProfilePost(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 201, description: "SF6 ranked profile created successfully", type: responseType }),
        ApiResponse({ status: 400, description: "Invalid input" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiSFSixRankedProfileGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 200, description: "Success", type: responseType }),
        ApiResponse({ status: 404, description: "SF6 ranked profile not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiSFSixRankedProfilePatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 200, description: "SF6 ranked profile updated successfully", type: responseType }),
        ApiResponse({ status: 404, description: "SF6 ranked profile not found" }),
        ApiResponse({ status: 400, description: "Invalid input" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiSFSixRankedProfileDelete(summary: string, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 204, description: "SF6 ranked profile deleted successfully" }),
        ApiResponse({ status: 404, description: "SF6 ranked profile not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}
