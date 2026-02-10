import { ApiResponse } from "@nestjs/swagger";
import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";

export function ApiTournamentPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: [
            ...StandardResponses.forPost("Tournament", responseType),
            StandardResponses.notFound("Event"), // Extra: Parent event might not exist
        ],
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiTournamentGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forGet("Tournament", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiTournamentPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPatch("Tournament", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiTournamentDelete(summary: string, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forDelete("Tournament"),
        isDisabled,
        excludeFromSwagger: true,
    });
}
