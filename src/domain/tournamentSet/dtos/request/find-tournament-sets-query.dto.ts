import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class FindTournamentSetsQueryDto {
    @ApiPropertyOptional({ description: "Player one ID", example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    playerOneID?: number;

    @ApiPropertyOptional({ description: "Player two ID", example: 2 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    playerTwoID?: number;

    @ApiPropertyOptional({ description: "Tournament ID", example: 123 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    tournamentID?: number;

    @ApiPropertyOptional({ description: "Start.gg set ID", example: 456789 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    startggSetID?: number;

    @ApiPropertyOptional({ description: "Bracket name", example: "Winners Finals" })
    @IsOptional()
    @IsString()
    bracketName?: string;

    @ApiPropertyOptional({ description: "Bracket round", example: "Top 8" })
    @IsOptional()
    @IsString()
    bracketRound?: string;

    @ApiPropertyOptional({ description: "Matches to win", example: 3 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    matchesToWin?: number;

    @ApiPropertyOptional({ description: "Winner name", example: "Punk" })
    @IsOptional()
    @IsString()
    winnerName?: string;

    @ApiPropertyOptional({ description: "Winner ID", example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    winnerID?: number;

    @ApiPropertyOptional({ description: "Limit results", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({ description: "Sort by field", example: "bracketName", default: "bracketName" })
    @IsOptional()
    @IsString()
    sortBy?: string = "bracketName";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
