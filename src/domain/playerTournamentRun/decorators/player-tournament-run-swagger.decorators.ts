import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "@decorators/endpoint-status-toggles";

export function ApiPlayerTournamentRunPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 201, description: "Player tournament run created successfully", type: responseType }),
        ApiResponse({ status: 400, description: "Invalid input" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiPlayerTournamentRunGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 200, description: "Success", type: responseType }),
        ApiResponse({ status: 404, description: "Player tournament run not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiPlayerTournamentRunPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 200, description: "Player tournament run updated successfully", type: responseType }),
        ApiResponse({ status: 404, description: "Player tournament run not found" }),
        ApiResponse({ status: 400, description: "Invalid input" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiPlayerTournamentRunDelete(summary: string, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 204, description: "Player tournament run deleted successfully" }),
        ApiResponse({ status: 404, description: "Player tournament run not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}
