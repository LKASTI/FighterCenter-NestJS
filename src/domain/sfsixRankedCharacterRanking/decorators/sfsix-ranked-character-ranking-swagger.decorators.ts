import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";

export function ApiSfsixRankedCharacterRankingPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPost("Ranking", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiSfsixRankedCharacterRankingGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forGet("Ranking", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiSfsixRankedCharacterRankingPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPatch("Ranking", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiSfsixRankedCharacterRankingDelete(summary: string, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forDelete("Ranking"),
        isDisabled,
        excludeFromSwagger: true,
    });
}
