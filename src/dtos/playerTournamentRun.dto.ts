import { Transform, Type } from "class-transformer";
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class CreatePlayerTournamentRunDTO {
    @IsNotEmpty()
    @IsNumber()
    readonly playerID: number;

    @IsNotEmpty()
    @IsNumber()
    readonly tournamentID: number;

    @IsNotEmpty()
    @IsString()
    readonly playerEntryName: string;

    @IsOptional()
    @IsNumber()
    readonly placement?: number;

    @IsOptional()
    @Transform(({ value: characterValues }) => {
        if (Array.isArray(characterValues)) {
            return characterValues.map((d) => String(d));
        }
        return [new String(characterValues)];
    })
    @IsArray()
    @IsString({ each: true })
    readonly charactersUsed?: string[];

    @IsOptional()
    @IsNumber()
    readonly seed?: number;
}

export class FindPlayerTournamentRunsQueryDTO {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    playerID?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    tournamentID?: number;

    @IsOptional()
    @IsString()
    playerEntryName?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    placement?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    charactersUsed?: string[];

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    seed?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @IsOptional()
    @IsString()
    sortBy?: string = "placement";

    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}

export class UpdatePlayerTournamentRunDTO {
    @IsOptional()
    @IsNumber()
    readonly playerID?: number;

    @IsOptional()
    @IsNumber()
    readonly tournamentID?: number;

    @IsOptional()
    @IsString()
    readonly playerEntryName?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    readonly charactersUsed?: string[];

    @IsOptional()
    @IsNumber()
    readonly placement?: number;

    @IsOptional()
    @IsNumber()
    readonly seed?: number;
}
