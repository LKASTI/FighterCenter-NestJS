import { IsString, IsNotEmpty, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class RankedFileParserDTO {
  @IsString()
  @IsNotEmpty()
  readonly filename: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  readonly date: Date;

  @IsNumber()
  @IsNotEmpty()
  readonly season: number;

  @IsNumber()
  @IsNotEmpty()
  readonly phase: number;
}

export class RankedDirectoryParserDTO {
  @IsString()
  @IsNotEmpty()
  readonly directory: string;

  @IsNumber()
  @IsNotEmpty()
  readonly season: number;

  @IsNumber()
  @IsNotEmpty()
  readonly phase: number;
}
