import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiRankedParserPost(
    summary: string,
    responseType?: any,
    isDisabled: boolean = false
) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.created("Data parsed and stored successfully", responseType),
            { status: 400, description: "Bad request - invalid file or parameters" },
            { status: 404, description: "File or directory not found" },
            StandardResponses.serverError(),
        ],
        isDisabled,
        excludeFromSwagger: true,
    });
}
