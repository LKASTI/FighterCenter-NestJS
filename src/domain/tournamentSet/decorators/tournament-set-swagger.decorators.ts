import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiTournamentSetPost(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: [
            StandardResponses.created("Tournament set created successfully", responseType),
            StandardResponses.invalidInput(),
            { status: 404, description: "Player or Tournament not found" }, // Custom: Multiple parent entities
            StandardResponses.serverError(),
        ],
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiTournamentSetGet(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forGet("Tournament set", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiTournamentSetPatch(summary: string, responseType?: any, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forPatch("Tournament set", responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiTournamentSetDelete(summary: string, isDisabled: boolean = false) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: StandardResponses.forDelete("Tournament set"),
        isDisabled,
        excludeFromSwagger: true,
    });
}
