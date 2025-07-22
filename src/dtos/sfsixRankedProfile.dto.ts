import { Type } from "class-transformer";
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class CreateSFSixRankedProfileDTO {
    @IsNumber()
    @IsNotEmpty()
    readonly usercode: number;

    @IsString()
    @IsNotEmpty()
    readonly cfn: string;

    @IsString()
    @IsOptional()
    readonly flag?: string;

    @IsNumber()
    @IsOptional()
    readonly playerID?: number;
}

export class FindSFSixRankedProfilesQueryDTO {
    @IsOptional()
    @IsString()
    cfn?: string;

    @IsOptional()
    @IsString()
    flag?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @IsOptional()
    @IsString()
    sortBy?: string = "cfn";

    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}

export class UpdateSFSixRankedProfileDTO {
    @IsOptional()
    @IsString()
    readonly cfn?: string;

    @IsOptional()
    @IsString()
    readonly flag?: string;
}
