import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min, IsNumber, IsIn } from "class-validator";

export class FindPlayersQueryDto {
    @ApiPropertyOptional({ description: "Filter by player name", example: "Punk" })
    @IsOptional()
    @IsString()
    playerName?: string;

    @ApiPropertyOptional({ description: "Filter by country code", example: "US" })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({ description: "Filter by Start.gg player ID", example: 12345 })
    @IsOptional()
    @IsNumber()
    startggPlayerID?: number;

    @ApiPropertyOptional({ description: "Filter by Start.gg profile image URL" })
    @IsOptional()
    @IsString()
    startggProfileImageURL?: string;

    @ApiPropertyOptional({ description: "Maximum number of results to return", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({
        description: "Field to sort by",
        example: "playerName",
        default: "playerName",
        enum: ["playerName", "country", "startggPlayerID", "startggProfileImageURL"]
    })
    @IsOptional()
    @IsString()
    @IsIn(["playerName", "country", "startggPlayerID", "startggProfileImageURL"])
    sortBy?: string = "playerName";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
