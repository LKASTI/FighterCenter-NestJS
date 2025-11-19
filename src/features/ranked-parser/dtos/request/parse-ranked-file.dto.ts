import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsDate, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class ParseRankedFileDto {
    @ApiProperty({
        description: "The filename of the ranked data JSON file",
        example: "ranked_P1_S4_2024-01-15.json"
    })
    @IsString()
    @IsNotEmpty()
    readonly filename: string;

    @ApiProperty({
        description: "Date of the ranked data snapshot",
        type: Date,
        example: "2024-01-15T00:00:00.000Z"
    })
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    readonly date: Date;

    @ApiProperty({
        description: "Season number",
        example: 4,
        minimum: 1
    })
    @IsNumber()
    @IsNotEmpty()
    readonly season: number;

    @ApiProperty({
        description: "Phase number within the season",
        example: 1,
        minimum: 1
    })
    @IsNumber()
    @IsNotEmpty()
    readonly phase: number;
}
