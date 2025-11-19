import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateTournamentSetDto {
    @ApiProperty({ description: "Player one ID", example: 1 })
    @IsNotEmpty()
    @IsNumber()
    readonly playerOneID: number;

    @ApiProperty({ description: "Player two ID", example: 2 })
    @IsNotEmpty()
    @IsNumber()
    readonly playerTwoID: number;

    @ApiProperty({ description: "Tournament ID", example: 123 })
    @IsNotEmpty()
    @IsNumber()
    readonly tournamentID: number;

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

    @ApiProperty({ description: "Winner name", example: "Punk" })
    @IsNotEmpty()
    @IsString()
    readonly winnerName: string;

    @ApiProperty({ description: "Winner ID", example: 1 })
    @IsNotEmpty()
    @IsNumber()
    readonly winnerID: number;
}
