import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUrl, ValidateIf } from "class-validator";

export class UpdateBucklerConfigDTO {
    @ApiPropertyOptional({
        description: "Enable or disable the ranked scraper cron job",
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional({
        description: "Buckler session cookie (buckler_id). Send null to clear.",
        example: "42z-p0IsJTuWBJ5dqrYFNXst...",
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((o) => o.bucklerId !== null)
    @IsString()
    bucklerId?: string | null;

    @ApiPropertyOptional({
        description: "Buckler request tracking cookie (buckler_r_id). Send null to clear.",
        example: "a3869b62-5f7a-40db-b681-bb5a70485f25",
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((o) => o.bucklerRId !== null)
    @IsString()
    bucklerRId?: string | null;

    @ApiPropertyOptional({
        description: "Buckler timestamp cookie (buckler_praise_date). Send null to clear.",
        example: "1767654671139",
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((o) => o.bucklerPraiseDate !== null)
    @IsString()
    bucklerPraiseDate?: string | null;

    @ApiPropertyOptional({
        description: "Current ranked phase number. Send null to clear.",
        example: 11,
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((o) => o.phase !== null)
    @IsInt()
    phase?: number | null;

    @ApiPropertyOptional({
        description: "Current season number. Send null to clear.",
        example: 3,
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((o) => o.season !== null)
    @IsInt()
    season?: number | null;

    @ApiPropertyOptional({
        description: "Discord webhook URL for scraper notifications. Send null to clear.",
        example: "https://discord.com/api/webhooks/123456789/abcdefg",
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((o) => o.discordWebhookUrl !== null)
    @IsUrl()
    discordWebhookUrl?: string | null;

    @ApiPropertyOptional({
        description: "Date the current phase started (for phase transition reminders). Send null to clear.",
        example: "2025-11-01",
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((o) => o.phaseStartDate !== null)
    @IsDateString()
    phaseStartDate?: string | null;
}
