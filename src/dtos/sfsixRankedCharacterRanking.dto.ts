import { Type } from "class-transformer";
import {
    IsDate,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class CreateSFSixRankedCharacterRankingDTO {
    @IsString()
    @IsNotEmpty()
    readonly league: string;

    @IsNumber()
    @IsNotEmpty()
    readonly phase: number;

    @IsNumber()
    @IsNotEmpty()
    readonly season: number;

    @IsNumber()
    @IsNotEmpty()
    readonly masterRating: number;

    @IsNumber()
    @IsNotEmpty()
    readonly rank: number;

    @IsDate()
    @Type(() => Date) // Transform incoming string to Date object
    @IsNotEmpty()
    readonly date: Date;

    @IsNumber()
    @IsNotEmpty()
    readonly sfsixRankedCharacterID: number;
}

export class FindSFSixRankedCharacterRankingsQueryDTO {
    @IsString()
    @IsOptional()
    readonly league?: string;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly phase?: number;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly season?: number;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly masterRating?: number;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly rank?: number;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    readonly sfsixRankedCharacterRankingID?: number;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    readonly sfsixRankedCharacterID?: number;

    @IsDate()
    @Type(() => Date) // Transform incoming string to Date object
    @IsOptional()
    readonly date?: Date;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @IsOptional()
    @IsString()
    sortBy?: string = "rank";

    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}

export class UpdateSFSixRankedCharacterRankingDTO {
    @IsString()
    @IsOptional()
    readonly league: string;

    @IsNumber()
    @IsOptional()
    readonly phase: number;

    @IsNumber()
    @IsOptional()
    readonly season: number;

    @IsNumber()
    @IsOptional()
    readonly masterRating: number;

    @IsNumber()
    @IsOptional()
    readonly rank: number;

    @IsDate()
    @Type(() => Date) // Transform incoming string to Date object
    @IsOptional()
    readonly date: Date;

    @IsNumber()
    @IsOptional()
    readonly sfsixRankedCharacterID: number;
}
