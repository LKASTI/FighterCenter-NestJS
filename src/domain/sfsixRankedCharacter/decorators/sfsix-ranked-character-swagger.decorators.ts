import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "@decorators/endpoint-status-toggles";

export function ApiSFSixRankedCharacterPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 201, description: "SF6 ranked character created successfully", type: responseType }),
        ApiResponse({ status: 400, description: "Invalid input" }),
        ApiResponse({ status: 404, description: "SF6 ranked profile not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiSFSixRankedCharacterGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 200, description: "Success", type: responseType }),
        ApiResponse({ status: 404, description: "SF6 ranked character not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiSFSixRankedCharacterPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 200, description: "SF6 ranked character updated successfully", type: responseType }),
        ApiResponse({ status: 404, description: "SF6 ranked character not found" }),
        ApiResponse({ status: 400, description: "Invalid input" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiSFSixRankedCharacterDelete(summary: string, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 204, description: "SF6 ranked character deleted successfully" }),
        ApiResponse({ status: 404, description: "SF6 ranked character not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}
