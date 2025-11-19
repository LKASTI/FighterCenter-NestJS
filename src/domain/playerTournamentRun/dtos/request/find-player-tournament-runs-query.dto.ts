import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class FindPlayerTournamentRunsQueryDto {
    @ApiPropertyOptional({ description: "Filter by player ID", example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    playerID?: number;

    @ApiPropertyOptional({ description: "Filter by tournament ID", example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    tournamentID?: number;

    @ApiPropertyOptional({ description: "Filter by player entry name", example: "Punk" })
    @IsOptional()
    @IsString()
    playerEntryName?: string;

    @ApiPropertyOptional({ description: "Filter by placement", example: 3 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    placement?: number;

    @ApiPropertyOptional({ description: "Filter by characters used", example: ["Cammy", "Ken"] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    charactersUsed?: string[];

    @ApiPropertyOptional({ description: "Filter by seed", example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    seed?: number;

    @ApiPropertyOptional({ description: "Maximum number of results to return", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({ description: "Field to sort by", example: "placement", default: "placement" })
    @IsOptional()
    @IsString()
    sortBy?: string = "placement";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
