import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
    IsArray,
    IsDate,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from "class-validator";

export class FindStartggUsersQueryDto {
    @ApiPropertyOptional({ description: "Filter by user UUID", example: "123e4567-e89b-12d3-a456-426614174000" })
    @IsOptional()
    @IsUUID()
    startggUserID?: string;

    @ApiPropertyOptional({ description: "Filter by Start.gg ID", example: "12345" })
    @IsOptional()
    @IsString()
    @Type(() => String)
    startggId?: string;

    @ApiPropertyOptional({ description: "Filter by OAuth token", example: "token123" })
    @IsOptional()
    @IsString()
    startggToken: string;

    @ApiPropertyOptional({ description: "Filter by OAuth refresh token", example: "refresh123" })
    @IsOptional()
    @IsString()
    startggRefreshToken: string;

    @ApiPropertyOptional({ description: "Filter by encrypted token", example: "encrypted123" })
    @IsOptional()
    @IsString()
    startggEncryptedToken: string;

    @ApiPropertyOptional({ description: "Filter by encrypted refresh token", example: "encryptedRefresh123" })
    @IsOptional()
    @IsString()
    startggEncryptedRefreshToken: string;

    @ApiPropertyOptional({ description: "Filter by token expiration", example: 1234567890000 })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    startggTokenExpiresIn: number;

    @ApiPropertyOptional({ description: "Filter by username", example: "player123" })
    @IsOptional()
    @IsString()
    startggUsername?: string;

    @ApiPropertyOptional({ description: "Filter by gamer tag", example: "ProPlayer" })
    @IsOptional()
    @IsString()
    startggGamerTag: string;

    @ApiPropertyOptional({ description: "Filter by roles", example: ["admin", "user"] })
    @IsOptional()
    @Transform(({ value: roleValues }) => {
        if (Array.isArray(roleValues)) {
            return roleValues.map((d) => String(d));
        }
        return [new String(roleValues)];
    })
    @IsArray()
    @IsString({ each: true })
    roles?: string[];

    @ApiPropertyOptional({ description: "Filter by tournament series", example: ["series1", "series2"] })
    @IsOptional()
    @Transform(({ value: tournamentSeriesValues }) => {
        if (Array.isArray(tournamentSeriesValues)) {
            return tournamentSeriesValues.map((d) => String(d));
        }
        return [new String(tournamentSeriesValues)];
    })
    @IsArray()
    @IsString({ each: true })
    tournamentSeriesAssigned?: string[];

    @ApiPropertyOptional({ description: "Filter by SF6 characters", example: ["Cammy", "Ken"] })
    @IsOptional()
    @Transform(({ value: sf6ProfileCharactersValues }) => {
        if (Array.isArray(sf6ProfileCharactersValues)) {
            return sf6ProfileCharactersValues.map((d) => String(d));
        }
        return [new String(sf6ProfileCharactersValues)];
    })
    @IsArray()
    @IsString({ each: true })
    sf6ProfileCharacters?: string[];

    @ApiPropertyOptional({ description: "Filter by creation date", example: "2024-01-15T00:00:00.000Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    createdAt?: Date;

    @ApiPropertyOptional({ description: "Filter by update date", example: "2024-01-15T00:00:00.000Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    updatedAt?: Date;

    @ApiPropertyOptional({ description: "Maximum number of results to return", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({ description: "Field to sort by", example: "username", default: "username" })
    @IsOptional()
    @IsString()
    sortBy?: string = "username";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    readonly order?: "ASC" | "DESC" = "ASC";
}
