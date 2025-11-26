import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter to sanitize error messages in production
 *
 * Security features:
 * - Hides stack traces in production
 * - Prevents internal path disclosure
 * - Logs full error details server-side
 * - Returns sanitized errors to clients
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isProduction = process.env.NODE_ENV === 'production';

        // Determine HTTP status
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        // Get error message
        let message: string | object = 'An error occurred';

        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                // Preserve validation errors and structured messages
                message = exceptionResponse;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // In production, sanitize error messages for 5xx errors
        if (isProduction && status >= 500) {
            message = 'Internal server error';
        }

        // Log full error details server-side (including stack trace)
        if (exception instanceof Error) {
            this.logger.error(
                `${request.method} ${request.url} - Status: ${status}`,
                exception.stack
            );
        } else {
            this.logger.error(
                `${request.method} ${request.url} - Status: ${status}`,
                JSON.stringify(exception)
            );
        }

        // Return sanitized error to client
        const errorResponse = {
            statusCode: status,
            message: message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        // Only include stack trace in non-production environments for 5xx errors
        if (!isProduction && status >= 500 && exception instanceof Error) {
            errorResponse['stack'] = exception.stack;
        }

        response.status(status).json(errorResponse);
    }
}
