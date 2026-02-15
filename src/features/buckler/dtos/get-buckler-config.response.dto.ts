import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetBucklerConfigResponseDTO {
    @ApiProperty({
        description: "Whether the ranked scraper cron job is enabled",
        example: true,
    })
    enabled: boolean;

    @ApiPropertyOptional({
        description: "Masked buckler_id cookie (first 6 + last 4 chars)",
        example: "42z-p0...pMEy",
    })
    bucklerId: string | null;

    @ApiPropertyOptional({
        description: "Masked buckler_r_id cookie (first 6 + last 4 chars)",
        example: "a3869b...f25",
    })
    bucklerRId: string | null;

    @ApiPropertyOptional({
        description: "Masked buckler_praise_date cookie",
        example: "176765...1139",
    })
    bucklerPraiseDate: string | null;

    @ApiPropertyOptional({
        description: "Current ranked phase number",
        example: 11,
    })
    phase: number | null;

    @ApiPropertyOptional({
        description: "Current season number",
        example: 3,
    })
    season: number | null;

    @ApiPropertyOptional({
        description: "Discord webhook URL (masked)",
        example: "https:...defg",
    })
    discordWebhookUrl: string | null;

    @ApiPropertyOptional({
        description: "Date the current phase started",
        example: "2025-11-01",
    })
    phaseStartDate: Date | null;

    @ApiProperty({
        description: "When the config was last updated",
        example: "2026-02-15T23:00:00.000Z",
    })
    updatedAt: Date;
}
