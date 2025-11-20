import { applyDecorators, Type, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiResponseOptions, ApiExcludeEndpoint } from "@nestjs/swagger";
import { DisableEndpoint } from "@decorators/endpoint-status-toggles";

export interface BaseDecoratorOptions {
    summary: string;
    guard?: Type<any>;
    responses: ApiResponseOptions[];
    isDisabled?: boolean;
    excludeFromSwagger?: boolean;
    additionalDecorators?: Array<ClassDecorator | MethodDecorator | PropertyDecorator>;
}

/**
 * Centralized decorator factory for creating consistent API endpoint decorators
 * - ApiExcludeEndpoint logic (hide disabled endpoints from Swagger)
 * - DisableEndpoint logic (mark endpoints as disabled)
 * - Guard application
 * - Response documentation
 */
export function createApiDecorator(options: BaseDecoratorOptions) {
    const {
        summary,
        guard,
        responses,
        isDisabled = false,
        excludeFromSwagger = true,
        additionalDecorators = [],
    } = options;

    const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
        ApiOperation({ summary }),
    ];

    // Apply guard if specified
    if (guard) {
        decorators.unshift(UseGuards(guard));
    }

    // Add all API responses
    responses.forEach(response => {
        decorators.push(ApiResponse(response));
    });

    // Add any additional custom decorators
    decorators.push(...additionalDecorators);

    // Handle disabled endpoints - SINGLE SOURCE OF TRUTH
    if (isDisabled) {
        decorators.push(DisableEndpoint());

        // Optionally exclude from Swagger documentation
        if (excludeFromSwagger) {
            decorators.push(ApiExcludeEndpoint());
        }
    }

    return applyDecorators(...decorators);
}
