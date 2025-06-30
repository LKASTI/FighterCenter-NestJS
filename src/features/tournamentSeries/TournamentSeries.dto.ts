import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class TournamentSeriesPlayerDTO {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose()
    playerId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose()
    tournamentID?: number;

    @IsOptional()
    @IsString()
    @Expose()
    playerName?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose()
    placement?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Expose()
    charactersUsed?: string[];

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose()
    seed?: number;

    @IsOptional()
    @IsString()
    @Expose()
    startggProfileImageURL?: string;

    @IsOptional()
    @IsString()
    @Expose()
    country?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose()
    tournamentId?: number;
}

export class TournamentSeriesTopXPlayersDTO {
    @IsOptional()
    tournamentIDs: number[];

    @IsOptional()
    x: number;
}

