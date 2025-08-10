import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";


export class CreateTwitterShareDto {
    @IsOptional()
    @IsString()
    readonly twitterShareId?: string;

    @IsOptional()
    @IsString()
    readonly pageUrl?: string;

    @IsOptional()
    @IsString()
    readonly imageUrl?: string;

    @IsOptional()
    @IsString()
    readonly title?: string;

    @IsOptional()
    @IsString()
    readonly description?: string;

    @IsOptional()
    @Type(() => Date)
    readonly createDate?: Date;

    @IsOptional()
    @Type(() => Date)
    readonly updateDate?: Date;
}

export class FindTwitterShareDto {
    @IsOptional()
    @IsString()
    twitterShareId?: string;

    @IsOptional()
    @IsString()
    pageUrl?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Type(() => Date)
    createDate?: Date;

    @IsOptional()
    @Type(() => Date)
    updateDate?: Date;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @IsOptional()
    @IsString()
    sortBy?: string = "title";

    @IsOptional()
    @IsString()
    readonly order?: "ASC" | "DESC" = "ASC";
}

export class UpdateTwitterShareDto {
    @IsOptional()
    @IsString()
    readonly twitterShareId?: string;

    @IsOptional()
    @IsString()
    readonly pageUrl?: string;

    @IsOptional()
    @IsString()
    readonly imageUrl?: string;

    @IsOptional()
    @IsString()
    readonly title?: string;

    @IsOptional()
    @IsString()
    readonly description?: string;

    @IsOptional()
    @Type(() => Date)
    readonly createDate?: Date;

    @IsOptional()
    @Type(() => Date)
    readonly updateDate?: Date;
}