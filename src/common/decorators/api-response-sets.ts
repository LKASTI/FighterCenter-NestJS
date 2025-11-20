import { ApiResponse, ApiResponseOptions } from "@nestjs/swagger";

/**
 * Standard HTTP response builders for consistent API documentation
 * These provide reusable ApiResponse decorators for common HTTP scenarios
 */
export class StandardResponses {
    // Individual response builders
    static success(description: string, type?: any): ApiResponseOptions {
        return {
            status: 200,
            description,
            type,
        };
    }

    static created(description: string, type?: any): ApiResponseOptions {
        return {
            status: 201,
            description,
            type,
        };
    }

    static updated(description: string, type?: any): ApiResponseOptions {
        return {
            status: 200,
            description,
            type,
        };
    }

    static deleted(description: string = "Deleted successfully"): ApiResponseOptions {
        return {
            status: 204,
            description,
        };
    }

    static notFound(entityName: string = "Resource"): ApiResponseOptions {
        return {
            status: 404,
            description: `${entityName} not found`,
        };
    }

    static invalidInput(description: string = "Invalid input"): ApiResponseOptions {
        return {
            status: 400,
            description,
        };
    }

    static serverError(): ApiResponseOptions {
        return {
            status: 500,
            description: "Internal server error",
        };
    }

    static unauthorized(): ApiResponseOptions {
        return {
            status: 401,
            description: "Unauthorized",
        };
    }

    static forbidden(): ApiResponseOptions {
        return {
            status: 403,
            description: "Forbidden",
        };
    }

    static rateLimit(): ApiResponseOptions {
        return {
            status: 429,
            description: "Too many requests",
        };
    }

    // Composite response sets for common HTTP methods
    static forGet(entityName: string, responseType?: any): ApiResponseOptions[] {
        return [
            this.success("Success", responseType),
            this.notFound(entityName),
            this.serverError(),
        ];
    }

    static forPost(entityName: string, responseType?: any): ApiResponseOptions[] {
        return [
            this.created(`${entityName} created successfully`, responseType),
            this.invalidInput(),
            this.serverError(),
        ];
    }

    static forPatch(entityName: string, responseType?: any): ApiResponseOptions[] {
        return [
            this.updated(`${entityName} updated successfully`, responseType),
            this.notFound(entityName),
            this.invalidInput(),
            this.serverError(),
        ];
    }

    static forDelete(entityName: string): ApiResponseOptions[] {
        return [
            this.deleted(`${entityName} deleted successfully`),
            this.notFound(entityName),
            this.serverError(),
        ];
    }
}
