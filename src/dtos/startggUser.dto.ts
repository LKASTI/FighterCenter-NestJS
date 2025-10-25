import { Transform, Type } from "class-transformer";
import {
    IsArray,
    IsDate,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from "class-validator";

export class CreateStartggUserDTO {
    @IsNotEmpty()
    @IsString()
    readonly startggId: string;

    @IsOptional()
    @IsString()
    readonly startggToken?: string;

    @IsOptional()
    @IsString()
    readonly startggRefreshToken?: string;

    @IsOptional()
    @IsString()
    readonly startggEncryptedToken?: string;

    @IsOptional()
    @IsString()
    readonly startggEncryptedRefreshToken?: string;

    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    readonly startggTokenExpiresIn: number;

    @IsNotEmpty()
    @IsString()
    readonly startggUsername: string;

    @IsOptional()
    @IsString()
    readonly startggGamerTag: string;

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

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly createdAt?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly updatedAt?: Date;
}

export class FindStartggUsersQueryDTO {
    @IsOptional()
    @IsUUID()
    startggUserID?: string;

    @IsOptional()
    @IsString()
    @Type(() => String)
    startggId?: string;

    @IsOptional()
    @IsString()
    startggToken: string;

    @IsOptional()
    @IsString()
    startggRefreshToken: string;

    @IsOptional()
    @IsString()
    startggEncryptedToken: string;

    @IsOptional()
    @IsString()
    startggEncryptedRefreshToken: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    startggTokenExpiresIn: number;

    @IsOptional()
    @IsString()
    startggUsername?: string;

    @IsOptional()
    @IsString()
    startggGamerTag: string;

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

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    createdAt?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    updatedAt?: Date;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @IsOptional()
    @IsString()
    sortBy?: string = "username";

    @IsOptional()
    @IsString()
    readonly order?: "ASC" | "DESC" = "ASC";
}

export class UpdateStartggUserDTO {
    @IsOptional()
    @IsUUID()
    readonly startggUserID?: string;

    @IsOptional()
    @IsString()
    readonly startggId?: string;

    @IsOptional()
    @IsString()
    readonly startggToken?: string;

    @IsOptional()
    @IsString()
    readonly startggRefreshToken?: string;

    @IsOptional()
    @IsString()
    readonly startggEncryptedToken?: string;

    @IsOptional()
    @IsString()
    readonly startggEncryptedRefreshToken?: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    readonly startggTokenExpiresIn?: number;

    @IsOptional()
    @IsString()
    readonly startggUsername?: string;

    @IsOptional()
    @IsString()
    readonly startggGamerTag?: string;

    @IsOptional()
    @Transform(({ value: roleValues }) => {
        if (Array.isArray(roleValues)) {
            return roleValues.map((d) => String(d));
        }
        return [new String(roleValues)];
    })
    @IsArray()
    @IsString({ each: true })
    readonly roles?: string[];

    @IsOptional()
    @Transform(({ value: tournamentSeriesAssignedValues }) => {
        if (Array.isArray(tournamentSeriesAssignedValues)) {
            return tournamentSeriesAssignedValues.map((d) => String(d));
        }
        return [new String(tournamentSeriesAssignedValues)];
    })
    @IsArray()
    @IsString({ each: true })
    readonly tournamentSeriesAssigned?: string[];

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

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly createdAt?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly updatedAt?: Date;
}
