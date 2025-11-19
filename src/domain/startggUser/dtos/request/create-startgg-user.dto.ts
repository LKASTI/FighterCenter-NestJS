import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
    IsArray,
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateStartggUserDto {
    @ApiProperty({ description: "Start.gg user ID", example: "12345" })
    @IsNotEmpty()
    @IsString()
    readonly startggId: string;

    @ApiPropertyOptional({ description: "Start.gg OAuth token", example: "token123" })
    @IsOptional()
    @IsString()
    readonly startggToken?: string;

    @ApiPropertyOptional({ description: "Start.gg OAuth refresh token", example: "refresh123" })
    @IsOptional()
    @IsString()
    readonly startggRefreshToken?: string;

    @ApiPropertyOptional({ description: "Encrypted Start.gg OAuth token", example: "encrypted123" })
    @IsOptional()
    @IsString()
    readonly startggEncryptedToken?: string;

    @ApiPropertyOptional({ description: "Encrypted Start.gg OAuth refresh token", example: "encryptedRefresh123" })
    @IsOptional()
    @IsString()
    readonly startggEncryptedRefreshToken?: string;

    @ApiProperty({ description: "Token expiration timestamp", example: 1234567890000 })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    readonly startggTokenExpiresIn: number;

    @ApiProperty({ description: "Start.gg username", example: "player123" })
    @IsNotEmpty()
    @IsString()
    readonly startggUsername: string;

    @ApiPropertyOptional({ description: "Start.gg gamer tag", example: "ProPlayer" })
    @IsOptional()
    @IsString()
    readonly startggGamerTag: string;

    @ApiPropertyOptional({ description: "User email address", example: "player@example.com" })
    @IsOptional()
    @IsEmail()
    readonly email?: string;

    @ApiPropertyOptional({ description: "User roles", example: ["admin", "user"] })
    @IsOptional()
    @Transform(({ value: roleValues }) => {
        if (Array.isArray(roleValues)) {
            return roleValues.map((d) => String(d));
        }
        return [new String(roleValues)];
    })
    @IsArray()
    @IsString({ each: true })
    readonly roles: string[];

    @ApiPropertyOptional({ description: "Assigned tournament series", example: ["series1", "series2"] })
    @IsOptional()
    @Transform(({ value: tournamentSeriesAssignedValues }) => {
        if (Array.isArray(tournamentSeriesAssignedValues)) {
            return tournamentSeriesAssignedValues.map((d) => String(d));
        }
        return [new String(tournamentSeriesAssignedValues)];
    })
    @IsArray()
    @IsString({ each: true })
    readonly tournamentSeriesAssigned: string[];

    @ApiPropertyOptional({ description: "SF6 profile characters", example: ["Cammy", "Ken"] })
    @IsOptional()
    @Transform(({ value: sf6ProfileCharactersValues }) => {
        if (Array.isArray(sf6ProfileCharactersValues)) {
            return sf6ProfileCharactersValues.map((d) => String(d));
        }
        return [new String(sf6ProfileCharactersValues)];
    })
    @IsArray()
    @IsString({ each: true })
    readonly sf6ProfileCharacters?: string[];

    @ApiPropertyOptional({ description: "Creation timestamp", example: "2024-01-15T00:00:00.000Z" })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly createdAt?: Date;

    @ApiPropertyOptional({ description: "Last update timestamp", example: "2024-01-15T00:00:00.000Z" })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly updatedAt?: Date;
}
