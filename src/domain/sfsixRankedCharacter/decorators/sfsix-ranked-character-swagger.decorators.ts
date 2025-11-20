import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiSFSixRankedCharacterPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: [
            StandardResponses.created("SF6 ranked character created successfully", responseType),
            StandardResponses.invalidInput(),
            StandardResponses.notFound("SF6 ranked profile"), // Custom: Parent profile
            StandardResponses.serverError(),
        ],
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiSFSixRankedCharacterGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forGet("SF6 ranked character", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiSFSixRankedCharacterPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPatch("SF6 ranked character", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiSFSixRankedCharacterDelete(summary: string, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forDelete("SF6 ranked character"),
        isDisabled,
        excludeFromSwagger: true,
    });
}
