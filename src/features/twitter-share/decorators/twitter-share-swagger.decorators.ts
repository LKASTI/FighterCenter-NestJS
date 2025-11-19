import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

export function ApiTwitterShareGet(summary: string, responseType?: any) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiResponse({ status: 200, description: "Success", type: responseType }),
        ApiResponse({ status: 404, description: "Twitter share not found" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    );
}

export function ApiTwitterSharePost(summary: string, responseType?: any, rateLimit: { limit: number; ttl: number } = { limit: 10, ttl: 60000 }) {
    return applyDecorators(
        ApiOperation({ summary }),
        Throttle({ default: rateLimit }),
        ApiResponse({ status: 201, description: "Created successfully", type: responseType }),
        ApiResponse({ status: 200, description: "Success", type: responseType }),
        ApiResponse({ status: 400, description: "Bad request" }),
        ApiResponse({ status: 429, description: "Rate limit exceeded" }),
        ApiResponse({ status: 500, description: "Internal server error" }),
    );
}

export function ApiTwitterShareUpload(summary: string) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    image: {
                        type: 'string',
                        format: 'binary',
                        description: 'Image file to upload (PNG, JPEG, or WebP)'
                    }
                }
            }
        }),
        Throttle({ default: { limit: 10, ttl: 60000 } }),
        ApiResponse({ status: 200, description: "Image uploaded successfully", schema: { properties: { imageUrl: { type: 'string' } } } }),
        ApiResponse({ status: 400, description: "No image file provided" }),
        ApiResponse({ status: 429, description: "Rate limit exceeded" }),
        ApiResponse({ status: 500, description: "Upload failed" }),
    );
}
