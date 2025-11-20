import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiPlayerTournamentRunPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPost("Player tournament run", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiPlayerTournamentRunGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forGet("Player tournament run", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiPlayerTournamentRunPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPatch("Player tournament run", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiPlayerTournamentRunDelete(summary: string, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forDelete("Player tournament run"),
        isDisabled,
        excludeFromSwagger: true,
    });
}
