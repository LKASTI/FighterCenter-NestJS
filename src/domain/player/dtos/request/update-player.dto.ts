import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber } from "class-validator";

export class UpdatePlayerDto {
    @ApiPropertyOptional({ description: "Player name", example: "Punk" })
    @IsOptional()
    @IsString()
    readonly playerName?: string;

    @ApiPropertyOptional({ description: "Player's country code", example: "US" })
    @IsOptional()
    @IsString()
    readonly country?: string;

    @ApiPropertyOptional({ description: "Start.gg player ID", example: 12345 })
    @IsOptional()
    @IsNumber()
    readonly startggPlayerID?: number;

    @ApiPropertyOptional({ description: "Start.gg profile image URL", example: "https://images.start.gg/images/user/123/image.png" })
    @IsOptional()
    @IsString()
    readonly startggProfileImageURL?: string;
}
