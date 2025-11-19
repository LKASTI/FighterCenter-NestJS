import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsInt, IsOptional, IsString, Min } from "class-validator";

export class FindEventsQueryDto {
    @ApiPropertyOptional({ description: "Filter by event name", example: "Capcom Cup" })
    @IsOptional()
    @IsString()
    eventName?: string;

    @ApiPropertyOptional({ description: "Filter by region", example: "NA" })
    @IsOptional()
    @IsString()
    region?: string;

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

    @ApiPropertyOptional({ description: "Filter by tournament series status", example: false })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isTournamentSeries?: boolean;

    @ApiPropertyOptional({ description: "Maximum number of results", example: 100, default: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 1000;

    @ApiPropertyOptional({ description: "Field to sort by", example: "eventName", default: "eventName" })
    @IsOptional()
    @IsString()
    sortBy?: string = "eventName";

    @ApiPropertyOptional({ description: "Sort order", example: "ASC", default: "ASC", enum: ["ASC", "DESC"] })
    @IsOptional()
    @IsString()
    order?: "ASC" | "DESC" = "ASC";
}
