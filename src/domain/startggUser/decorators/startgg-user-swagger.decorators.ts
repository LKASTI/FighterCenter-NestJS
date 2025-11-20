import { BasicStartggAuthGuard } from "@authentication/guards/basicStartggAuth.guard";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiStartggUserPut(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: BasicStartggAuthGuard,
        responses: [
            StandardResponses.success("Successfully updated", responseType),
            StandardResponses.invalidInput(),
            StandardResponses.unauthorized(),
            StandardResponses.serverError(),
        ],
    });
}

export function ApiStartggUserGet(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        guard: BasicStartggAuthGuard,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.unauthorized(),
            StandardResponses.notFound("User"),
            StandardResponses.serverError(),
        ],
    });
}
