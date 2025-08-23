import { Transform, Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class CreateTournamentDTO {
    @IsString()
    @IsNotEmpty()
    readonly tournamentName: string;

    @IsString()
    @IsOptional()
    readonly tournamentRegion?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    readonly numEntrants?: number;

    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly dates?: Date[];

    @IsNotEmpty()
    @IsString()
    readonly gameName: string;

    @IsOptional()
    @IsString()
    readonly gamePatch?: string;

    @IsOptional()
    @IsString()
    readonly gameSeason?: string;

    @IsOptional()
    @IsString()
    readonly vodLink?: string;

    @IsOptional()
    @IsString()
    readonly tournamentType?: string;

    @IsOptional()
    @IsBoolean()
    readonly isOnline?: boolean;

    @IsOptional()
    @IsBoolean()
    readonly top8GraphicIsFile?: boolean;

    @IsOptional()
    @IsString()
    readonly tournamentTop8GraphicImage?: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    readonly eventID: number;
}

export class FindTournamentsQueryDTO {
    constructor() {}

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    tournamentID?: number;

    @IsOptional()
    @IsString()
    tournamentName?: string;

    @IsString()
    @IsOptional()
    tournamentRegion?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    numEntrants?: number;

    @IsOptional()
    @Transform(({ value: dateValues }) => {
        if (Array.isArray(dateValues)) {
            return dateValues.map((d) => new Date(d));
        }
        return [new Date(dateValues)];
    })
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    dates?: Date[];

    @IsOptional()
    @IsString()
    gameName?: string;

    @IsOptional()
    @IsString()
    gamePatch?: string;

    @IsOptional()
    @IsString()
    gameSeason?: string;

    @IsOptional()
    @IsString()
    tournamentType?: string;

    @IsOptional()
    @IsString()
    vodLink?: string;

    @IsOptional()
    @IsBoolean()
    isOnline?: boolean;

    @IsOptional()
    @IsBoolean()
    top8GraphicIsFile?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    eventID?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @IsOptional()
    @IsString()
    sortBy?: string = "tournamentName";

    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}

export class UpdateTournamentDTO {
    @IsString()
    @IsOptional()
    readonly tournamentName?: string;

    @IsString()
    @IsOptional()
    readonly tournamentRegion?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    readonly numEntrants?: number;

    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly dates?: Date[];

    @IsString()
    @IsOptional()
    readonly gameName?: string;

    @IsString()
    @IsOptional()
    readonly gamePatch?: string;

    @IsString()
    @IsOptional()
    readonly gameSeason?: string;

    @IsString()
    @IsOptional()
    readonly vodLink?: string;

    @IsString()
    @IsOptional()
    readonly tournamentType?: string;

    @IsBoolean()
    @IsOptional()
    readonly isOnline?: boolean;

    @IsOptional()
    @IsBoolean()
    readonly top8GraphicIsFile?: boolean;

    @IsString()
    @IsOptional()
    readonly tournamentTop8GraphicImage?: string;

    @IsNumber()
    @IsOptional()
    readonly eventID?: number;
}
