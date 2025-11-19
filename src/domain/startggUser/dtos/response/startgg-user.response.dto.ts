import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class StartggUserResponseDto {
    @ApiProperty({ description: "Start.gg user UUID", example: "123e4567-e89b-12d3-a456-426614174000" })
    startggUserID: string;

    @ApiProperty({ description: "Start.gg user ID", example: "12345" })
    startggId: string;

    @ApiProperty({ description: "Start.gg username", example: "player123" })
    startggUsername: string;

    @ApiPropertyOptional({ description: "Start.gg gamer tag", example: "ProPlayer" })
    startggGamerTag?: string;

    @ApiPropertyOptional({ description: "User email", example: "player@example.com" })
    email?: string;

    @ApiPropertyOptional({ description: "User roles", example: ["admin", "user"] })
    roles?: string[];

    @ApiPropertyOptional({ description: "Assigned tournament series", example: ["series1", "series2"] })
    tournamentSeriesAssigned?: string[];

    @ApiPropertyOptional({ description: "SF6 profile characters", example: ["Cammy", "Ken"] })
    sf6ProfileCharacters?: string[];

    @ApiProperty({ description: "Creation timestamp", example: "2024-01-15T00:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ description: "Last update timestamp", example: "2024-01-15T00:00:00.000Z" })
    updatedAt: Date;
}

export class StartggUsersResponseDto {
    @ApiProperty({ type: [StartggUserResponseDto] })
    data: StartggUserResponseDto[];

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
