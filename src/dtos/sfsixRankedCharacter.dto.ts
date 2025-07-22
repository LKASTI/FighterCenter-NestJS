import { Type } from "class-transformer";
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";
import { isBigInt64Array } from "util/types";

export class CreateSFSixRankedCharacterDTO {
    @IsString()
    @IsNotEmpty()
    readonly characterName: string;

    @IsNumber()
    @IsNotEmpty()
    readonly usercode: number;
}

export class FindSFSixRankedCharactersQueryDTO {
    @IsOptional()
    @IsString()
    characterName?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    usercode?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @IsOptional()
    @IsString()
    sortBy?: string = "characterName";

    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}

export class UpdateSFSixRankedCharacterDTO {
    @IsOptional()
    @IsString()
    readonly characterName?: string;

    @IsOptional()
    @IsString()
    readonly usercode?: number;
}
