import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class TournamentSeriesPlayerDto {
    @ApiPropertyOptional({
        description: "Player's unique identifier",
        example: 12345
    })
    @Expose()
    playerID?: number;

    @ApiPropertyOptional({
        description: "Tournament unique identifier",
        example: 67890
    })
    @Expose()
    tournamentID?: number;

    @ApiPropertyOptional({
        description: "Player's display name in the tournament",
        example: "Punk"
    })
    @Expose()
    playerName?: string;

    @ApiPropertyOptional({
        description: "Player's final placement in the tournament",
        example: 1
    })
    @Expose()
    placement?: number;

    @ApiPropertyOptional({
        description: "Array of character names used by the player",
        type: [String],
        example: ["Cammy", "Karin"]
    })
    @Expose()
    charactersUsed?: string[];

    @ApiPropertyOptional({
        description: "Player's seed in the tournament",
        example: 1
    })
    @Expose()
    seed?: number;

    @ApiPropertyOptional({
        description: "URL to player's Start.gg profile image",
        example: "https://images.start.gg/images/user/12345/image.png"
    })
    @Expose()
    startggProfileImageURL?: string;

    @ApiPropertyOptional({
        description: "Player's country code",
        example: "US"
    })
    @Expose()
    country?: string;

    @ApiPropertyOptional({
        description: "Tournament ID (alias for tournamentID)",
        example: 67890
    })
    @Expose()
    tournamentId?: number;
}
