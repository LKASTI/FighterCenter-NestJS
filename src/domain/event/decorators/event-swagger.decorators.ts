import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";

export function ApiEventPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPost("Event", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiEventGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forGet("Event", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiEventPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPatch("Event", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiEventDelete(summary: string, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forDelete("Event"),
        isDisabled,
        excludeFromSwagger: true,
    });
}
