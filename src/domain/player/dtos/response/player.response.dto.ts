import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PlayerResponseDto {
    @ApiProperty({ description: "Player ID", example: 1 })
    playerID: number;

    @ApiProperty({ description: "Player name", example: "Punk" })
    playerName: string;

    @ApiPropertyOptional({ description: "Player's country code", example: "US" })
    country?: string;

    @ApiPropertyOptional({ description: "Start.gg player ID", example: 12345 })
    startggPlayerID?: number;

    @ApiPropertyOptional({ description: "Start.gg profile image URL" })
    startggProfileImageURL?: string;
}
