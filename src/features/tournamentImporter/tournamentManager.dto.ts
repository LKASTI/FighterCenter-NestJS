import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateSeriesTournamentDTO {

    @IsString()
    @IsOptional()
    readonly tournamentName?: string;

    @IsString()
    @IsOptional()
    readonly tournamentRegion?: string;

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
}