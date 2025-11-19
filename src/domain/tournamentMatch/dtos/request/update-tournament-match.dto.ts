import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";

export class UpdateTournamentMatchDto {
    @ApiPropertyOptional({ description: "Tournament set ID", example: 123 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    readonly tournamentSetID?: number;

    @ApiPropertyOptional({ description: "Player one character", example: "Luke" })
    @IsOptional()
    @IsString()
    readonly playerOneCharacter?: string;

    @ApiPropertyOptional({ description: "Player two character", example: "JP" })
    @IsOptional()
    @IsString()
    readonly playerTwoCharacter?: string;

    @ApiPropertyOptional({ description: "Winner name", example: "Punk" })
    @IsOptional()
    @IsString()
    readonly winnerName?: string;

    @ApiPropertyOptional({ description: "Match number", example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    readonly matchNumber?: number;
}
