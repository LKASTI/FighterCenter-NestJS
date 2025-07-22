import { Type } from "class-transformer";
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    IsNumber,
} from "class-validator";

export class CreatePlayerDTO {
    @IsNotEmpty()
    @IsString()
    readonly playerName: string;

    @IsOptional()
    @IsString()
    readonly country?: string;

    @IsOptional()
    @IsNumber()
    readonly startggPlayerID?: number;

    @IsOptional()
    @IsString()
    readonly startggProfileImageURL?: string;
}

export class FindPlayersQueryDTO {
    @IsOptional()
    @IsString()
    playerName?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsNumber()
    startggPlayerID?: number;

    @IsOptional()
    @IsString()
    startggProfileImageURL?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @IsOptional()
    @IsString()
    sortBy?: string = "playerName";

    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}

export class UpdatePlayerDTO {
    @IsOptional()
    @IsString()
    readonly playerName?: string;

    @IsOptional()
    @IsString()
    readonly country?: string;

    @IsOptional()
    @IsNumber()
    readonly startggPlayerID?: number;

    @IsOptional()
    @IsString()
    readonly startggProfileImageURL?: string;
}
