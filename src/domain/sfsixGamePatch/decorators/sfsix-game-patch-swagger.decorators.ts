import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiSFSixGamePatchGet(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.serverError(),
        ],
    });
}
