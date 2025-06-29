import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateEventDTO {
  @IsNotEmpty()
  @IsString()
  readonly eventName: string;

  @IsOptional()
  @IsString()
  readonly region?: string;

  @IsOptional()
  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  readonly dates?: Date[];

  @IsOptional()
  @IsBoolean()
  readonly isTournamentSeries?: boolean;

  @IsOptional()
  @IsString()
  readonly tournamentSeriesBannerImage?: string;

  @IsOptional()
  @IsString()
  readonly tournamentSeriesLogoImage?: string;
}

export class FindEventsQueryDTO {
  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  @IsString()
  region?: string;

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
  @Type(() => Boolean)
  @IsBoolean()
  isTournamentSeries?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 1000;

  @IsOptional()
  @IsString()
  sortBy?: string = 'eventName';

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'ASC';
}

export class UpdateEventDTO {
  @IsOptional()
  @IsString()
  readonly eventName?: string;

  @IsOptional()
  @IsString()
  readonly region?: string;

  @IsOptional()
  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  readonly dates?: Date[];

  @IsOptional()
  @IsBoolean()
  readonly isTournamentSeries?: boolean;

  @IsOptional()
  @IsString()
  readonly tournamentSeriesBannerImage?: string;

  @IsOptional()
  @IsString()
  readonly tournamentSeriesLogoImage?: string;
}
