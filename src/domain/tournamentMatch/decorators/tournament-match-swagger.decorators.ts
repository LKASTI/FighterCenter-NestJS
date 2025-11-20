import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiTournamentMatchPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: [
            StandardResponses.created("Tournament match created successfully", responseType),
            StandardResponses.invalidInput(),
            StandardResponses.notFound("Tournament set"), // Custom: Parent tournament set
            StandardResponses.serverError(),
        ],
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiTournamentMatchGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forGet("Tournament match", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiTournamentMatchPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPatch("Tournament match", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiTournamentMatchDelete(summary: string, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forDelete("Tournament match"),
        isDisabled,
        excludeFromSwagger: true,
    });
}
