import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTournamentMatchDto {
    @ApiProperty({ description: "Tournament set ID", example: 123 })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    readonly tournamentSetID: number;

    @ApiPropertyOptional({ description: "Player one character", example: "Luke" })
    @IsOptional()
    @IsString()
    readonly playerOneCharacter?: string;

    @ApiPropertyOptional({ description: "Player two character", example: "JP" })
    @IsOptional()
    @IsString()
    readonly playerTwoCharacter?: string;

    @ApiProperty({ description: "Winner name", example: "Punk" })
    @IsNotEmpty()
    @IsString()
    readonly winnerName: string;

    @ApiProperty({ description: "Match number", example: 1 })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    readonly matchNumber: number;
}
