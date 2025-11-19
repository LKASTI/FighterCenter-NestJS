import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTournamentDto {
    @ApiProperty({ description: "Tournament name", example: "Capcom Cup 2024" })
    @IsString()
    @IsNotEmpty()
    readonly tournamentName: string;

    @ApiPropertyOptional({ description: "Tournament region", example: "NA" })
    @IsString()
    @IsOptional()
    readonly tournamentRegion?: string;

    @ApiPropertyOptional({ description: "Number of entrants", example: 256 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    readonly numEntrants?: number;

    @ApiPropertyOptional({ description: "Tournament dates", type: [Date] })
    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly dates?: Date[];

    @ApiProperty({ description: "Game name", example: "Street Fighter 6" })
    @IsNotEmpty()
    @IsString()
    readonly gameName: string;

    @ApiPropertyOptional({ description: "Game patch version", example: "1.2.0" })
    @IsOptional()
    @IsString()
    readonly gamePatch?: string;

    @ApiPropertyOptional({ description: "Game season", example: "Season 1" })
    @IsOptional()
    @IsString()
    readonly gameSeason?: string;

    @ApiPropertyOptional({ description: "VOD link", example: "https://youtube.com/watch?v=..." })
    @IsOptional()
    @IsString()
    readonly vodLink?: string;

    @ApiPropertyOptional({ description: "Tournament type", example: "Major" })
    @IsOptional()
    @IsString()
    readonly tournamentType?: string;

    @ApiPropertyOptional({ description: "Is this an online tournament?", example: false })
    @IsOptional()
    @IsBoolean()
    readonly isOnline?: boolean;

    @ApiPropertyOptional({ description: "Is top 8 graphic a file?", example: false })
    @IsOptional()
    @IsBoolean()
    readonly top8GraphicIsFile?: boolean;

    @ApiPropertyOptional({ description: "Top 8 graphic image URL" })
    @IsOptional()
    @IsString()
    readonly tournamentTop8GraphicImage?: string;

    @ApiProperty({ description: "Event ID this tournament belongs to", example: 1 })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    readonly eventID: number;
}
