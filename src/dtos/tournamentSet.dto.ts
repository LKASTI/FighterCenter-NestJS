import { Type } from "class-transformer";
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class CreateTournamentSetDTO {
    @IsNotEmpty()
    @IsNumber()
    readonly playerOneID: number;

    @IsNotEmpty()
    @IsNumber()
    readonly playerTwoID: number;

    @IsNotEmpty()
    @IsNumber()
    readonly tournamentID: number;

    @IsOptional()
    @IsNumber()
    readonly startggSetID?: number;

    @IsOptional()
    @IsString()
    readonly bracketName?: string;

    @IsOptional()
    @IsString()
    readonly bracketRound?: string;

    @IsOptional()
    @IsNumber()
    readonly matchesToWin?: number;

    @IsNotEmpty()
    @IsString()
    readonly winnerName: string;

    @IsNotEmpty()
    @IsNumber()
    readonly winnerID: number;
}

export class FindTournamentSetsQueryDTO {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    playerOneID?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    playerTwoID?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    tournamentID?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    startggSetID?: number;

    @IsOptional()
    @IsString()
    bracketName?: string;

    @IsOptional()
    @IsString()
    bracketRound?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    matchesToWin?: number;

    @IsOptional()
    @IsString()
    winnerName?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    winnerID?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @IsOptional()
    @IsString()
    sortBy?: string = "bracketName";

    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}

export class UpdateTournamentSetDTO {
    @IsOptional()
    @IsNumber()
    readonly playerOneID?: number;

    @IsOptional()
    @IsNumber()
    readonly playerTwoID?: number;

    @IsOptional()
    @IsNumber()
    readonly tournamentID?: number;

    @IsOptional()
    @IsNumber()
    readonly startggSetID?: number;

    @IsOptional()
    @IsString()
    readonly bracketName?: string;

    @IsOptional()
    @IsString()
    readonly bracketRound?: string;

    @IsOptional()
    @IsNumber()
    readonly matchesToWin?: number;

    @IsOptional()
    @IsString()
    readonly winnerName?: string;

    @IsOptional()
    @IsNumber()
    readonly winnerID?: number;
}
