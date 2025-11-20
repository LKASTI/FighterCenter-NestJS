import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiSFSixRankedProfilePost(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPost("SF6 ranked profile", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiSFSixRankedProfileGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forGet("SF6 ranked profile", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiSFSixRankedProfilePatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPatch("SF6 ranked profile", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiSFSixRankedProfileDelete(summary: string, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forDelete("SF6 ranked profile"),
        isDisabled,
        excludeFromSwagger: true,
    });
}
