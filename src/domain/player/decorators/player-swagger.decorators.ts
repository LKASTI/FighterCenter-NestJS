import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";

export function ApiPlayerPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPost("Player", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiPlayerGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forGet("Player", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiPlayerPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPatch("Player", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiPlayerDelete(summary: string, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forDelete("Player"),
        isDisabled,
        excludeFromSwagger: true,
    });
}
