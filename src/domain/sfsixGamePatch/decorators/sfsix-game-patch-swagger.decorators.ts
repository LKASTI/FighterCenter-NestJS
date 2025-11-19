import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function ApiSFSixGamePatchGet(summary: string, responseType?: any) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiResponse({ status: 200, description: "Success", type: responseType }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    );
}
