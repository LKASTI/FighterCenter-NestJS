import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTournamentMatchDTO {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  readonly tournamentSetID: number;

  @IsOptional()
  @IsString()
  readonly playerOneCharacter?: string;

  @IsOptional()
  @IsString()
  readonly playerTwoCharacter?: string;

  @IsNotEmpty()
  @IsString()
  readonly winnerName: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  readonly matchNumber: number;
}

export class FindTournamentMatchesQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tournamentSetID?: number;

  @IsOptional()
  @IsString()
  playerOneCharacter?: string;

  @IsOptional()
  @IsString()
  playerTwoCharacter?: string;

  @IsOptional()
  @IsString()
  winnerName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  matchNumber?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 1000;

  @IsOptional()
  @IsString()
  sortBy?: string = 'matchNumber';

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'ASC';
}

export class UpdateTournamentMatchDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly tournamentSetID?: number;

  @IsOptional()
  @IsString()
  readonly playerOneCharacter?: string;

  @IsOptional()
  @IsString()
  readonly playerTwoCharacter?: string;

  @IsOptional()
  @IsString()
  readonly winnerName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly matchNumber?: number;
}
