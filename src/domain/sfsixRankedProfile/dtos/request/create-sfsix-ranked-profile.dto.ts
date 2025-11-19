import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsNumber,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateSFSixRankedProfileDto {
    @ApiProperty({ description: "User code", example: 123456789 })
    @IsNumber()
    @IsNotEmpty()
    readonly usercode: number;

    @ApiProperty({ description: "CFN (Character Fighter Name)", example: "PunkDaGod" })
    @IsString()
    @IsNotEmpty()
    readonly cfn: string;

    @ApiPropertyOptional({ description: "Country flag code", example: "US" })
    @IsString()
    @IsOptional()
    readonly flag?: string;

    @ApiPropertyOptional({ description: "Player ID", example: 1 })
    @IsNumber()
    @IsOptional()
    readonly playerID?: number;
}
