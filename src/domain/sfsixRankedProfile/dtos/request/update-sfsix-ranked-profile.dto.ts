import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateSFSixRankedProfileDto {
    @ApiPropertyOptional({ description: "CFN (Character Fighter Name)", example: "PunkDaGod" })
    @IsOptional()
    @IsString()
    readonly cfn?: string;

    @ApiPropertyOptional({ description: "Country flag code", example: "US" })
    @IsOptional()
    @IsString()
    readonly flag?: string;
}
