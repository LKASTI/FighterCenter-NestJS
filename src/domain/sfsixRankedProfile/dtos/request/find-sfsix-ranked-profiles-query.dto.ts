import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsInt,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class FindSFSixRankedProfilesQueryDto {
    @ApiPropertyOptional({ description: "CFN (Character Fighter Name)", example: "PunkDaGod" })
    @IsOptional()
    @IsString()
    cfn?: string;

    @ApiPropertyOptional({ description: "Country flag code", example: "US" })
    @IsOptional()
    @IsString()
    flag?: string;

    @ApiPropertyOptional({ description: "Limit results", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({ description: "Sort by field", example: "cfn", default: "cfn" })
    @IsOptional()
    @IsString()
    sortBy?: string = "cfn";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
