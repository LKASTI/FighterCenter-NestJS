import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
    IsDate,
    IsBoolean,
    IsNumber,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class StartGGTournamentDataParserDTO {
    @IsOptional()
    @IsString()
    readonly tournamentPlayersFileName: string;

    @IsNotEmpty()
    @IsString()
    readonly tournamentSetsFileName: string;

    @IsNotEmpty()
    @IsString()
    readonly eventName: string;

    @IsNotEmpty()
    @IsString()
    readonly tournamentName: string;

    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly eventDates?: Date[];

    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly tournamentDates?: Date[];

    @IsOptional()
    @IsString()
    readonly eventRegion?: string;

    @IsNotEmpty()
    @IsString()
    readonly gameName: string;

    @IsString()
    @IsOptional()
    readonly tournamentType: string;

    @IsOptional()
    @IsBoolean()
    readonly isOnline?: string;

    @IsOptional()
    @IsString()
    readonly vodLink?: string;
}

export class StartGGTournamentDataV2ParserDTO {
    // @ApiProperty({description: "The delay in milliseconds between each startgg api page request", example: 1000}, )
    @IsOptional()
    @IsNumber()
    readonly requestDelay: number = 1000;

    // @ApiProperty({description: "The number of sets to fetch per page", example: 10}, )
    @IsOptional()
    @IsNumber()
    readonly perPageCount: number = 10;

    // @ApiProperty({description: "The maximum number of sets to fetch", example: 200}, )
    @IsOptional()
    @IsNumber()
    readonly setLimit: number = 200;

    // @ApiProperty({description: "If the player's profile image should be updated from startgg api", example: true}, )
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    readonly mustUpdatePlayerProfileImage?: boolean = true;

    // @ApiProperty({description: "If the player's country should be updated from startgg api", example: true, }, )
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    readonly mustUpdatePlayerCountry?: boolean = false;

    @ApiProperty({description: "The startgg url of the tournament event page", example: "", required: true, type: "string"}, )
    @IsNotEmpty()
    @IsString()
    readonly startggUrl: string;

    // @ApiProperty({description: "The startgg slug of the tournament", example: ""}, )
    @IsOptional()
    @IsString()
    readonly startggSlug?: string;

    // @ApiProperty({description: "The startgg slug of the event", example: ""}, )
    @IsOptional()
    @IsString()
    readonly startggEventSlug?: string;

    @ApiProperty({description: "The name of the tournament series for the tournament", example: "Motivation Academy"}, )
    @IsNotEmpty()
    @IsString()
    readonly eventName: string;

    @IsOptional()
    @IsString()
    readonly gamePatch?: string;

    @IsOptional()
    @IsString()
    readonly gameSeason?: string;

    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly eventDates?: Date[];

    @ApiProperty({description: "The dates the tournament occurs", example: ["2024-02-27", "2024-02-28"], type: "array"}, )
    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly tournamentDates?: Date[];

    @ApiProperty({description: "The region of the tournament series occurs in", example: "NA", type: "string"}, )
    @IsOptional()
    @IsString()
    readonly eventRegion?: string;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    readonly isTournamentSeries?: boolean = true;

    @IsOptional()
    @Type(() => String)
    @IsString()
    readonly top8GraphicUrl?: string;

    @ApiProperty({description: "The type of tournament (e.g., 'Weekly', 'Monthly', 'Regional')", example: "Weekly", type: "string"}, )
    @IsString()
    @IsOptional()
    readonly tournamentType?: string;

    @ApiProperty({description: "The region of the tournament (e.g., 'NA', 'EU')", example: "NA", type: "string"}, )
    @IsString()
    @IsOptional()
    readonly tournamentRegion?: string;

    @ApiProperty({description: "The name of the tournament", example: "Motivation Academy NA #41: Safe Jumps!", type: "string"}, )
    @IsString()
    @IsOptional()
    readonly tournamentName?: string;

    @ApiProperty({description: "The url link of the tournaments VOD", example: "", type: "string"}, )
    @IsOptional()
    @IsString()
    readonly vodLink?: string;
}
