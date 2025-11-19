import { ApiProperty } from "@nestjs/swagger";

export class SfsixRankedCharacterRankingResponseDto {
    @ApiProperty({ description: "Unique identifier for the ranking", example: 1 })
    sfsixRankedCharacterRankingID: number;

    @ApiProperty({ description: "League name", example: "Master" })
    league: string;

    @ApiProperty({ description: "Phase number", example: 1 })
    phase: number;

    @ApiProperty({ description: "Season number", example: 2 })
    season: number;

    @ApiProperty({ description: "Master rating points", example: 1500 })
    masterRating: number;

    @ApiProperty({ description: "Rank position", example: 42 })
    rank: number;

    @ApiProperty({ description: "Date of ranking", example: "2024-01-15T00:00:00.000Z" })
    date: Date;

    @ApiProperty({ description: "SF6 Ranked Character ID", example: 123 })
    sfsixRankedCharacterID: number;
}

export class SfsixRankedCharacterRankingsResponseDto {
    @ApiProperty({ type: [SfsixRankedCharacterRankingResponseDto] })
    data: SfsixRankedCharacterRankingResponseDto[];

    @ApiProperty({
        description: "Metadata about the response",
        example: { limit: 100, total: 500 }
    })
    meta: {
        limit: number;
        total: number;
    };
}
