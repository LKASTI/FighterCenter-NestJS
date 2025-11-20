import { ApiConsumes, ApiBody } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { createApiDecorator, StandardResponses } from "@common/decorators";

export function ApiTwitterShareGet(summary: string, responseType?: any) {
    return createApiDecorator({
        summary,
        responses: [
            StandardResponses.success("Success", responseType),
            StandardResponses.notFound("Twitter share"),
            StandardResponses.serverError(),
        ],
    });
}

export function ApiTwitterSharePost(summary: string, responseType?: any, rateLimit: { limit: number; ttl: number } = { limit: 10, ttl: 60000 }) {
    return createApiDecorator({
        summary,
        responses: [
            StandardResponses.created("Created successfully", responseType),
            StandardResponses.success("Success", responseType),
            { status: 400, description: "Bad request" },
            StandardResponses.rateLimit(),
            StandardResponses.serverError(),
        ],
        additionalDecorators: [
            Throttle({ default: rateLimit }),
        ],
    });
}

export function ApiTwitterShareUpload(summary: string) {
    return createApiDecorator({
        summary,
        responses: [
            { status: 200, description: "Image uploaded successfully", schema: { properties: { imageUrl: { type: 'string' } } } },
            { status: 400, description: "No image file provided" },
            StandardResponses.rateLimit(),
            { status: 500, description: "Upload failed" },
        ],
        additionalDecorators: [
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
        ],
    });
}
