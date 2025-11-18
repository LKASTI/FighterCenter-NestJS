import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class FindTopXPlayersDto {
    @ApiProperty({
        description: "Array of tournament IDs to search within",
        type: [Number],
        example: [123, 456, 789]
    })
    @IsArray()
    @Type(() => Number)
    @IsInt({ each: true })
    tournamentIDs: number[];

    @ApiProperty({
        description: "Number of top players to retrieve (e.g., 8 for top 8)",
        example: 8,
        minimum: 1
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    x: number;
}
