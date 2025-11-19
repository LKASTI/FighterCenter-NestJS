import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateSFSixRankedCharacterDto {
    @ApiPropertyOptional({ description: "Character name", example: "Luke" })
    @IsOptional()
    @IsString()
    readonly characterName?: string;

    @ApiPropertyOptional({ description: "User code", example: 123456789 })
    @IsOptional()
    @IsString()
    readonly usercode?: number;
}
