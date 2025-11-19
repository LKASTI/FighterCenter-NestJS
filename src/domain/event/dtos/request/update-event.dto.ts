import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsOptional, IsString } from "class-validator";

export class UpdateEventDto {
    @ApiPropertyOptional({ description: "Event name", example: "Capcom Cup" })
    @IsOptional()
    @IsString()
    readonly eventName?: string;

    @ApiPropertyOptional({ description: "Event region", example: "NA" })
    @IsOptional()
    @IsString()
    readonly region?: string;

    @ApiPropertyOptional({ description: "Event dates", type: [Date] })
    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    readonly dates?: Date[];

    @ApiPropertyOptional({ description: "Is this a tournament series?", example: false })
    @IsOptional()
    @IsBoolean()
    readonly isTournamentSeries?: boolean;

    @ApiPropertyOptional({ description: "Tournament series banner image URL" })
    @IsOptional()
    @IsString()
    readonly tournamentSeriesBannerImage?: string;

    @ApiPropertyOptional({ description: "Tournament series logo image URL" })
    @IsOptional()
    @IsString()
    readonly tournamentSeriesLogoImage?: string;
}
