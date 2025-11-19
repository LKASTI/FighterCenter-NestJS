import { ApiProperty } from "@nestjs/swagger";

export class PlayerTournamentRunResponseDto {
    @ApiProperty({ description: "Player ID", example: 1 })
    playerID: number;

    @ApiProperty({ description: "Tournament ID", example: 10 })
    tournamentID: number;

    @ApiProperty({ description: "Player's entry name in the tournament", example: "Punk" })
    playerEntryName: string;

    @ApiProperty({ description: "Final placement in the tournament", example: 3 })
    placement: number;

    @ApiProperty({ description: "Characters used in the tournament", example: ["Cammy", "Ken"] })
    charactersUsed: string[];

    @ApiProperty({ description: "Seeding position in the tournament", example: 1 })
    seed: number;
}

export class PlayerTournamentRunsResponseDto {
    @ApiProperty({ type: [PlayerTournamentRunResponseDto] })
    data: PlayerTournamentRunResponseDto[];

    @ApiProperty({
        description: "Metadata about the response",
        example: { limit: 100, total: 500, totalPages: 5 }
    })
    meta: {
        limit: number;
        total: number;
        totalPages: number;
    };
}
