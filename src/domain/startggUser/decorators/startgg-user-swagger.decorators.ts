import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BasicStartggAuthGuard } from "@authentication/guards/basicStartggAuth.guard";

export function ApiStartggUserPut(summary: string, responseType?: any) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(BasicStartggAuthGuard),
        ApiResponse({ status: 200, description: "Successfully updated", type: responseType }),
        ApiResponse({ status: 400, description: "Invalid input" }),
        ApiResponse({ status: 401, description: "Unauthorized" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    return applyDecorators(...decorators);
}

export function ApiStartggUserGet(summary: string, responseType?: any) {
    const decorators = [
        ApiOperation({ summary }),
        UseGuards(BasicStartggAuthGuard),
        ApiResponse({ status: 200, description: "Success", type: responseType }),
        ApiResponse({ status: 401, description: "Unauthorized" }),
        ApiResponse({ status: 404, description: "User not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    ];

    return applyDecorators(...decorators);
}
