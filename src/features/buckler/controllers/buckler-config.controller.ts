import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Roles } from "@decorators/roles.decorator";
import { BucklerConfigService } from "../services/buckler-config.service";
import { SF6BucklerConfig } from "../entities/sf6BucklerConfig.entity";
import { UpdateBucklerConfigDTO } from "../dtos/update-buckler-config.dto";
import { GetBucklerConfigResponseDTO } from "../dtos/get-buckler-config.response.dto";
import { ApiBucklerConfigGet, ApiBucklerConfigPatch } from "../decorators/buckler-config-swagger.decorators";

@ApiTags("Buckler Config")
@Controller("buckler-config")
export class BucklerConfigController {
    constructor(
        private readonly configService: BucklerConfigService,
    ) {}

    @Get()
    @Roles("SUPER_ADMIN")
    @ApiBucklerConfigGet("Get current Buckler scraper config", GetBucklerConfigResponseDTO)
    async getConfig(): Promise<GetBucklerConfigResponseDTO> {
        const config = await this.configService.getConfig();
        return this.toResponseDTO(config);
    }

    @Patch()
    @Roles("SUPER_ADMIN")
    @ApiBucklerConfigPatch("Update Buckler scraper config", GetBucklerConfigResponseDTO)
    async updateConfig(
        @Body() dto: UpdateBucklerConfigDTO,
    ): Promise<GetBucklerConfigResponseDTO> {
        const updatePayload: Partial<Omit<SF6BucklerConfig, "id" | "updatedAt">> = {};

        if (dto.enabled !== undefined) updatePayload.enabled = dto.enabled;
        if (dto.bucklerId !== undefined) updatePayload.bucklerId = dto.bucklerId;
        if (dto.bucklerRId !== undefined) updatePayload.bucklerRId = dto.bucklerRId;
        if (dto.bucklerPraiseDate !== undefined) updatePayload.bucklerPraiseDate = dto.bucklerPraiseDate;
        if (dto.phase !== undefined) updatePayload.phase = dto.phase;
        if (dto.season !== undefined) updatePayload.season = dto.season;
        if (dto.discordWebhookUrl !== undefined) updatePayload.discordWebhookUrl = dto.discordWebhookUrl;
        if (dto.phaseStartDate !== undefined) updatePayload.phaseStartDate = dto.phaseStartDate ? new Date(dto.phaseStartDate) : null;

        const config = await this.configService.updateConfig(updatePayload);
        return this.toResponseDTO(config);
    }

    private toResponseDTO(config: SF6BucklerConfig): GetBucklerConfigResponseDTO {
        // Shared logic - masking cookies and webhook
        return {
            enabled: config.enabled,
            bucklerId: this.maskValue(config.bucklerId),
            bucklerRId: this.maskValue(config.bucklerRId),
            bucklerPraiseDate: this.maskValue(config.bucklerPraiseDate),
            phase: config.phase,
            season: config.season,
            discordWebhookUrl: this.maskValue(config.discordWebhookUrl),
            phaseStartDate: config.phaseStartDate,
            updatedAt: config.updatedAt,
        };
    }

    /**
     * Mask a sensitive string value for display.
     * Shows first 6 and last 4 characters with "..." in between.
     */
    private maskValue(value: string | null): string | null {
        if (!value) return null;
        if (value.length <= 12) return "***";
        return `${value.slice(0, 6)}...${value.slice(-4)}`;
    }
}
