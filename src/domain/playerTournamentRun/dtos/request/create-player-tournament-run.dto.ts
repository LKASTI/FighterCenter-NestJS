import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class CreatePlayerTournamentRunDto {
    @ApiProperty({ description: "Player ID", example: 1 })
    @IsNotEmpty()
    @IsNumber()
    readonly playerID: number;

    @ApiProperty({ description: "Tournament ID", example: 10 })
    @IsNotEmpty()
    @IsNumber()
    readonly tournamentID: number;

    @ApiProperty({ description: "Player's entry name in the tournament", example: "Punk" })
    @IsNotEmpty()
    @IsString()
    readonly playerEntryName: string;

    @ApiPropertyOptional({ description: "Final placement in the tournament", example: 3 })
    @IsOptional()
    @IsNumber()
    readonly placement?: number;

    @ApiPropertyOptional({ description: "Characters used in the tournament", example: ["Cammy", "Ken"] })
    @IsOptional()
    @Transform(({ value: characterValues }) => {
        if (Array.isArray(characterValues)) {
            return characterValues.map((d) => String(d));
        }
        return [new String(characterValues)];
    })
    @IsArray()
    @IsString({ each: true })
    readonly charactersUsed?: string[];

    @ApiPropertyOptional({ description: "Seeding position in the tournament", example: 1 })
    @IsOptional()
    @IsNumber()
    readonly seed?: number;
}
