import { ApiQuery, ApiParam } from "@nestjs/swagger";
import { FeatureFlagGuard } from "@authentication/guards/feature-flag.guard";
import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";

const startggResponses = (responseType?: any) => [
    StandardResponses.success("Success", responseType),
    { status: 400, description: "Bad request - invalid parameters" },
    { status: 401, description: "Unauthorized - no valid Start.gg token" },
    StandardResponses.rateLimit(),
    StandardResponses.serverError(),
];

export function ApiStartggGet(
    summary: string,
    responseType?: any,
    isDisabled: boolean = false
) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: startggResponses(responseType),
        isDisabled,
        excludeFromSwagger: true,
    });
}

export function ApiStartggGetWithQuery(
    summary: string,
    queryName: string,
    queryDescription: string,
    responseType?: any,
    isDisabled: boolean = false
) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: startggResponses(responseType),
        isDisabled,
        excludeFromSwagger: true,
        additionalDecorators: [
            ApiQuery({
                name: queryName,
                description: queryDescription,
                required: true,
                type: String
            }),
        ],
    });
}

export function ApiStartggGetWithParam(
    summary: string,
    paramName: string,
    paramDescription: string,
    responseType?: any,
    isDisabled: boolean = false
) {
    return createApiDecorator({
        summary,
        guard: FeatureFlagGuard,
        responses: startggResponses(responseType),
        isDisabled,
        excludeFromSwagger: true,
        additionalDecorators: [
            ApiParam({
                name: paramName,
                description: paramDescription,
                required: true,
                type: String
            }),
        ],
    });
}
