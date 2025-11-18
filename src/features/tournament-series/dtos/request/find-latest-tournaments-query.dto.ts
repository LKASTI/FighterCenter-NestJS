import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class FindLatestTournamentsQueryDto {
    @ApiPropertyOptional({
        description: "Comma-separated list or array of event series IDs",
        type: [String],
        example: ["12345", "67890"]
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',');
        }
        return Array.isArray(value) ? value : [value];
    })
    @IsArray()
    @IsString({ each: true })
    eventSeriesIds?: string[];
}
