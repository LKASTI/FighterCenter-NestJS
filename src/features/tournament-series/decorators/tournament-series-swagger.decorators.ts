import { ApiParam } from "@nestjs/swagger";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiTournamentSeriesGet(
    summary: string,
    responseType?: any
) {
    return createApiDecorator({
        summary,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.notFound("Resource"),
            StandardResponses.serverError(),
        ],
    });
}

export function ApiTournamentSeriesPost(
    summary: string,
    responseType?: any
) {
    return createApiDecorator({
        summary,
        responses: [
            StandardResponses.created("Resource created successfully", responseType),
            StandardResponses.success("Success", responseType),
            { status: 400, description: "Invalid input data" },
            StandardResponses.serverError(),
        ],
    });
}

export function ApiTournamentSeriesGetById(
    summary: string,
    paramName: string,
    responseType?: any
) {
    return createApiDecorator({
        summary,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.notFound("Resource"),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            ApiParam({
                name: paramName,
                description: `ID of the ${paramName}`,
                type: Number,
                required: true
            }),
        ],
    });
}
