import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
    IsDate,
    IsBoolean,
    IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class StartGGTournamentDataParserDTO {
    @IsOptional()
    @IsString()
    readonly tournamentPlayersFileName: string;

    @IsNotEmpty()
    @IsString()
    readonly tournamentSetsFileName: string;

    @IsNotEmpty()
    @IsString()
    readonly eventName: string;

    @IsNotEmpty()
    @IsString()
    readonly tournamentName: string;

    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly eventDates?: Date[];

    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly tournamentDates?: Date[];

    @IsOptional()
    @IsString()
    readonly eventRegion?: string;

    @IsNotEmpty()
    @IsString()
    readonly gameName: string;

    @IsString()
    @IsOptional()
    readonly tournamentType: string;

    @IsOptional()
    @IsBoolean()
    readonly isOnline?: string;

    @IsOptional()
    @IsString()
    readonly vodLink?: string;
}

export class StartGGTournamentDataV2ParserDTO {
    @IsOptional()
    @IsNumber()
    readonly requestDelay: number;

    @IsOptional()
    @IsNumber()
    readonly perPageCount: number;

    @IsOptional()
    @IsNumber()
    readonly setLimit: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    readonly mustUpdatePlayerProfileImage?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    readonly mustUpdatePlayerCountry?: boolean;

    @IsNotEmpty()
    @IsString()
    readonly startggUrl: string;

    @IsOptional()
    @IsString()
    readonly startggSlug?: string;

    @IsOptional()
    @IsString()
    readonly startggEventSlug?: string;

    @IsNotEmpty()
    @IsString()
    readonly eventName: string;

    @IsOptional()
    @IsString()
    readonly gamePatch?: string;

    @IsOptional()
    @IsString()
    readonly gameSeason?: string;

    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly eventDates?: Date[];

    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly tournamentDates?: Date[];

    @IsOptional()
    @IsString()
    readonly eventRegion?: string;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    readonly isTournamentSeries?: boolean;

    @IsOptional()
    @Type(() => String)
    @IsString()
    readonly top8GraphicUrl?: string;

    @IsString()
    @IsOptional()
    readonly tournamentType?: string;

    @IsString()
    @IsOptional()
    readonly tournamentRegion?: string;

    @IsString()
    @IsOptional()
    readonly tournamentName?: string;

    @IsOptional()
    @IsString()
    readonly vodLink?: string;
}
