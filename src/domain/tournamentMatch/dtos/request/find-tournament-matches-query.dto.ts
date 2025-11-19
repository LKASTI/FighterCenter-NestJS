import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class FindTournamentMatchesQueryDto {
    @ApiPropertyOptional({ description: "Tournament set ID", example: 123 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    tournamentSetID?: number;

    @ApiPropertyOptional({ description: "Player one character", example: "Luke" })
    @IsOptional()
    @IsString()
    playerOneCharacter?: string;

    @ApiPropertyOptional({ description: "Player two character", example: "JP" })
    @IsOptional()
    @IsString()
    playerTwoCharacter?: string;

    @ApiPropertyOptional({ description: "Winner name", example: "Punk" })
    @IsOptional()
    @IsString()
    winnerName?: string;

    @ApiPropertyOptional({ description: "Match number", example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    matchNumber?: number;

    @ApiPropertyOptional({ description: "Limit results", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({ description: "Sort by field", example: "matchNumber", default: "matchNumber" })
    @IsOptional()
    @IsString()
    sortBy?: string = "matchNumber";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
