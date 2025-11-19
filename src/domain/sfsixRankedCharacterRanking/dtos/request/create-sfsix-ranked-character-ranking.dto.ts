import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsString,
} from "class-validator";

export class CreateSfsixRankedCharacterRankingDto {
    @ApiProperty({ description: "League name", example: "Master" })
    @IsString()
    @IsNotEmpty()
    readonly league: string;

    @ApiProperty({ description: "Phase number", example: 1 })
    @IsNumber()
    @IsNotEmpty()
    readonly phase: number;

    @ApiProperty({ description: "Season number", example: 2 })
    @IsNumber()
    @IsNotEmpty()
    readonly season: number;

    @ApiProperty({ description: "Master rating points", example: 1500 })
    @IsNumber()
    @IsNotEmpty()
    readonly masterRating: number;

    @ApiProperty({ description: "Rank position", example: 42 })
    @IsNumber()
    @IsNotEmpty()
    readonly rank: number;

    @ApiProperty({ description: "Date of ranking", example: "2024-01-15T00:00:00.000Z" })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    readonly date: Date;

    @ApiProperty({ description: "SF6 Ranked Character ID", example: 123 })
    @IsNumber()
    @IsNotEmpty()
    readonly sfsixRankedCharacterID: number;
}
