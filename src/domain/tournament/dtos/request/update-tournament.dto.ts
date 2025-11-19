import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateTournamentDto {
    @ApiPropertyOptional({ description: "Tournament name", example: "Capcom Cup 2024" })
    @IsString()
    @IsOptional()
    readonly tournamentName?: string;

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

    @ApiPropertyOptional({ description: "Game name", example: "Street Fighter 6" })
    @IsString()
    @IsOptional()
    readonly gameName?: string;

    @ApiPropertyOptional({ description: "Game patch version", example: "1.2.0" })
    @IsString()
    @IsOptional()
    readonly gamePatch?: string;

    @ApiPropertyOptional({ description: "Game season", example: "Season 1" })
    @IsString()
    @IsOptional()
    readonly gameSeason?: string;

    @ApiPropertyOptional({ description: "VOD link", example: "https://youtube.com/watch?v=..." })
    @IsString()
    @IsOptional()
    readonly vodLink?: string;

    @ApiPropertyOptional({ description: "Tournament type", example: "Major" })
    @IsString()
    @IsOptional()
    readonly tournamentType?: string;

    @ApiPropertyOptional({ description: "Is this an online tournament?", example: false })
    @IsBoolean()
    @IsOptional()
    readonly isOnline?: boolean;

    @ApiPropertyOptional({ description: "Is top 8 graphic a file?", example: false })
    @IsOptional()
    @IsBoolean()
    readonly top8GraphicIsFile?: boolean;

    @ApiPropertyOptional({ description: "Top 8 graphic image URL" })
    @IsString()
    @IsOptional()
    readonly tournamentTop8GraphicImage?: string;

    @ApiPropertyOptional({ description: "Event ID this tournament belongs to", example: 1 })
    @IsNumber()
    @IsOptional()
    readonly eventID?: number;
}
