import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsDate,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class FindSfsixRankedCharacterRankingsQueryDto {
    @ApiPropertyOptional({ description: "Filter by league", example: "Master" })
    @IsString()
    @IsOptional()
    readonly league?: string;

    @ApiPropertyOptional({ description: "Filter by phase", example: 1 })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly phase?: number;

    @ApiPropertyOptional({ description: "Filter by season", example: 2 })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly season?: number;

    @ApiPropertyOptional({ description: "Filter by master rating", example: 1500 })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly masterRating?: number;

    @ApiPropertyOptional({ description: "Filter by rank", example: 42 })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly rank?: number;

    @ApiPropertyOptional({ description: "Filter by ranking ID", example: 1 })
    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    readonly sfsixRankedCharacterRankingID?: number;

    @ApiPropertyOptional({ description: "Filter by character ID", example: 123 })
    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    readonly sfsixRankedCharacterID?: number;

    @ApiPropertyOptional({ description: "Filter by date", example: "2024-01-15T00:00:00.000Z" })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    readonly date?: Date;

    @ApiPropertyOptional({ description: "Maximum number of results to return", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({ description: "Field to sort by", example: "rank", default: "rank" })
    @IsOptional()
    @IsString()
    sortBy?: string = "rank";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
