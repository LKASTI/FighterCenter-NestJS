import { IsDate, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class FindSFSixGamePatchDTO {

    @IsOptional()
    @IsString()
    patchVersion?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    patchDate?: Date;

    @IsOptional()
    @IsString()
    sortBy?: string = "patchVersion";

    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}