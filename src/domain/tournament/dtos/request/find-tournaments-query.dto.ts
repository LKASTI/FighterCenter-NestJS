import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class FindTournamentsQueryDto {
    @ApiPropertyOptional({ description: "Filter by tournament ID", example: 1 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    tournamentID?: number;

    @ApiPropertyOptional({ description: "Filter by tournament name", example: "Capcom Cup 2024" })
    @IsOptional()
    @IsString()
    tournamentName?: string;

    @ApiPropertyOptional({ description: "Filter by region", example: "NA" })
    @IsString()
    @IsOptional()
    tournamentRegion?: string;

    @ApiPropertyOptional({ description: "Filter by number of entrants", example: 256 })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    numEntrants?: number;

    @ApiPropertyOptional({ description: "Filter by dates", type: [Date] })
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

    @ApiPropertyOptional({ description: "Filter by game name", example: "Street Fighter 6" })
    @IsOptional()
    @IsString()
    gameName?: string;

    @ApiPropertyOptional({ description: "Filter by game patch", example: "1.2.0" })
    @IsOptional()
    @IsString()
    gamePatch?: string;

    @ApiPropertyOptional({ description: "Filter by game season", example: "Season 1" })
    @IsOptional()
    @IsString()
    gameSeason?: string;

    @ApiPropertyOptional({ description: "Filter by tournament type", example: "Major" })
    @IsOptional()
    @IsString()
    tournamentType?: string;

    @ApiPropertyOptional({ description: "Filter by VOD link" })
    @IsOptional()
    @IsString()
    vodLink?: string;

    @ApiPropertyOptional({ description: "Filter by online status", example: false })
    @IsOptional()
    @IsBoolean()
    isOnline?: boolean;

    @ApiPropertyOptional({ description: "Filter by top 8 graphic file status", example: false })
    @IsOptional()
    @IsBoolean()
    top8GraphicIsFile?: boolean;

    @ApiPropertyOptional({ description: "Filter by event ID", example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    eventID?: number;

    @ApiPropertyOptional({ description: "Maximum number of results", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({ description: "Field to sort by", example: "tournamentName", default: "tournamentName" })
    @IsOptional()
    @IsString()
    sortBy?: string = "tournamentName";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
