import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class FindSFSixRankedCharactersQueryDto {
    @ApiPropertyOptional({ description: "Character name", example: "Luke" })
    @IsOptional()
    @IsString()
    characterName?: string;

    @ApiPropertyOptional({ description: "User code", example: 123456789 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    usercode?: number;

    @ApiPropertyOptional({ description: "Limit results", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({ description: "Sort by field", example: "characterName", default: "characterName" })
    @IsOptional()
    @IsString()
    sortBy?: string = "characterName";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
