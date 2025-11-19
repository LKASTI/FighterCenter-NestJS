import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsDate,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class UpdateSfsixRankedCharacterRankingDto {
    @ApiPropertyOptional({ description: "League name", example: "Master" })
    @IsString()
    @IsOptional()
    readonly league: string;

    @ApiPropertyOptional({ description: "Phase number", example: 1 })
    @IsNumber()
    @IsOptional()
    readonly phase: number;

    @ApiPropertyOptional({ description: "Season number", example: 2 })
    @IsNumber()
    @IsOptional()
    readonly season: number;

    @ApiPropertyOptional({ description: "Master rating points", example: 1500 })
    @IsNumber()
    @IsOptional()
    readonly masterRating: number;

    @ApiPropertyOptional({ description: "Rank position", example: 42 })
    @IsNumber()
    @IsOptional()
    readonly rank: number;

    @ApiPropertyOptional({ description: "Date of ranking", example: "2024-01-15T00:00:00.000Z" })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    readonly date: Date;

    @ApiPropertyOptional({ description: "SF6 Ranked Character ID", example: 123 })
    @IsNumber()
    @IsOptional()
    readonly sfsixRankedCharacterID: number;
}
