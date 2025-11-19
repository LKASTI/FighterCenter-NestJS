import { ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class UpdatePlayerTournamentRunDto {
    @ApiPropertyOptional({ description: "Player ID", example: 1 })
    @IsOptional()
    @IsNumber()
    readonly playerID?: number;

    @ApiPropertyOptional({ description: "Tournament ID", example: 10 })
    @IsOptional()
    @IsNumber()
    readonly tournamentID?: number;

    @ApiPropertyOptional({ description: "Player's entry name in the tournament", example: "Punk" })
    @IsOptional()
    @IsString()
    readonly playerEntryName?: string;

    @ApiPropertyOptional({ description: "Characters used in the tournament", example: ["Cammy", "Ken"] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    readonly charactersUsed?: string[];

    @ApiPropertyOptional({ description: "Final placement in the tournament", example: 3 })
    @IsOptional()
    @IsNumber()
    readonly placement?: number;

    @ApiPropertyOptional({ description: "Seeding position in the tournament", example: 1 })
    @IsOptional()
    @IsNumber()
    readonly seed?: number;
}
