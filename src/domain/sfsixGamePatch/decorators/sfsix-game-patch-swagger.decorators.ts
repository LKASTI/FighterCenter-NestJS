import { createApiDecorator, StandardResponses } from "@fgclegends/fightercenter-shared-nestjs";

export function ApiSFSixGamePatchGet(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.serverError(),
        ],
    });
}
