import { applyDecorators } from "@nestjs/common";
import {
    ApiOperation,
    ApiResponse,
    ApiParam
} from "@nestjs/swagger";

export function ApiTournamentSeriesGet(
    summary: string,
    responseType?: any
) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiResponse({
            status: 200,
            description: "Success",
            type: responseType
        }),
        ApiResponse({
            status: 404,
            description: "Resource not found"
        }),
        ApiResponse({
            status: 500,
            description: "Internal server error"
        }),
    );
}

export function ApiTournamentSeriesPost(
    summary: string,
    responseType?: any
) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiResponse({
            status: 201,
            description: "Resource created successfully",
            type: responseType
        }),
        ApiResponse({
            status: 200,
            description: "Success",
            type: responseType
        }),
        ApiResponse({
            status: 400,
            description: "Invalid input data"
        }),
        ApiResponse({
            status: 500,
            description: "Internal server error"
        }),
    );
}

export function ApiTournamentSeriesGetById(
    summary: string,
    paramName: string,
    responseType?: any
) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiParam({
            name: paramName,
            description: `ID of the ${paramName}`,
            type: Number,
            required: true
        }),
        ApiResponse({
            status: 200,
            description: "Success",
            type: responseType
        }),
        ApiResponse({
            status: 404,
            description: "Resource not found"
        }),
        ApiResponse({
            status: 500,
            description: "Internal server error"
        }),
    );
}
