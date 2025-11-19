import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";

export class FindSFSixGamePatchQueryDto {
    @ApiPropertyOptional({ description: "Filter by patch version", example: "1.2.0" })
    @IsOptional()
    @IsString()
    patchVersion?: string;

    @ApiPropertyOptional({ description: "Filter by patch date", type: Date })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    patchDate?: Date;

    @ApiPropertyOptional({ description: "Field to sort by", example: "patchVersion", default: "patchVersion" })
    @IsOptional()
    @IsString()
    sortBy?: string = "patchVersion";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
