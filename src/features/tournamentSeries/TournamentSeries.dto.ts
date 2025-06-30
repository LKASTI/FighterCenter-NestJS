import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TournamentSeriesPlayerDTO {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    playerId?: number;

    @IsOptional()
    @IsString()
    playerName?: string;

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
    @IsString()
    startggProfileImageURL?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    tournamentId?: number;
}