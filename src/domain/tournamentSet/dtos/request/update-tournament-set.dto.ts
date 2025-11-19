import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateTournamentSetDto {
    @ApiPropertyOptional({ description: "Player one ID", example: 1 })
    @IsOptional()
    @IsNumber()
    readonly playerOneID?: number;

    @ApiPropertyOptional({ description: "Player two ID", example: 2 })
    @IsOptional()
    @IsNumber()
    readonly playerTwoID?: number;

    @ApiPropertyOptional({ description: "Tournament ID", example: 123 })
    @IsOptional()
    @IsNumber()
    readonly tournamentID?: number;

    @ApiPropertyOptional({ description: "Start.gg set ID", example: 456789 })
    @IsOptional()
    @IsNumber()
    readonly startggSetID?: number;

    @ApiPropertyOptional({ description: "Bracket name", example: "Winners Finals" })
    @IsOptional()
    @IsString()
    readonly bracketName?: string;

    @ApiPropertyOptional({ description: "Bracket round", example: "Top 8" })
    @IsOptional()
    @IsString()
    readonly bracketRound?: string;

    @ApiPropertyOptional({ description: "Matches to win", example: 3 })
    @IsOptional()
    @IsNumber()
    readonly matchesToWin?: number;

    @ApiPropertyOptional({ description: "Winner name", example: "Punk" })
    @IsOptional()
    @IsString()
    readonly winnerName?: string;

    @ApiPropertyOptional({ description: "Winner ID", example: 1 })
    @IsOptional()
    @IsNumber()
    readonly winnerID?: number;
}
