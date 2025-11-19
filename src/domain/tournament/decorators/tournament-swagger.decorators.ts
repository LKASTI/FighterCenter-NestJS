import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "@decorators/endpoint-status-toggles";

export function ApiTournamentPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 201, description: "Tournament created successfully", type: responseType }),
        ApiResponse({ status: 400, description: "Invalid input" }),
        ApiResponse({ status: 404, description: "Event not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiTournamentGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 200, description: "Success", type: responseType }),
        ApiResponse({ status: 404, description: "Tournament not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiTournamentPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 200, description: "Tournament updated successfully", type: responseType }),
        ApiResponse({ status: 404, description: "Tournament not found" }),
        ApiResponse({ status: 400, description: "Invalid input" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}

export function ApiTournamentDelete(summary: string, isDisabled: boolean = false) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(FeatureFlagGuard),
        ApiResponse({ status: 204, description: "Tournament deleted successfully" }),
        ApiResponse({ status: 404, description: "Tournament not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    if (isDisabled) {
        decorators.push(DisableEndpoint());
    }

    return applyDecorators(...decorators);
}
