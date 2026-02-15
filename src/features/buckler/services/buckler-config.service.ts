import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SF6BucklerConfig } from "../entities/sf6BucklerConfig.entity";

@Injectable()
export class BucklerConfigService {
    private readonly logger = new Logger(BucklerConfigService.name);

    constructor(
        @InjectRepository(SF6BucklerConfig)
        private readonly configRepo: Repository<SF6BucklerConfig>,
    ) {}

    /**
     * Get the full config row
     */
    async getConfig(): Promise<SF6BucklerConfig> {
        const config = await this.configRepo.findOne({ where: { id: 1 } });
        if (!config) {
            this.logger.error("sf6_buckler_config row not found - run migrations");
            throw new Error("Buckler config not found. Ensure migrations have been run.");
        }
        return config;
    }

    /**
     * Update specific fields on the config row
     */
    async updateConfig(partial: Partial<Omit<SF6BucklerConfig, "id" | "updatedAt">>): Promise<SF6BucklerConfig> {
        await this.configRepo.update({ id: 1 }, partial);
        return this.getConfig();
    }

    async isEnabled(): Promise<boolean> {
        const config = await this.getConfig();
        return config.enabled;
    }

    async getCookies(): Promise<{ bucklerId: string | null; bucklerRId: string | null; bucklerPraiseDate: string | null }> {
        const config = await this.getConfig();
        return {
            bucklerId: config.bucklerId,
            bucklerRId: config.bucklerRId,
            bucklerPraiseDate: config.bucklerPraiseDate,
        };
    }

    async getPhaseAndSeason(): Promise<{ phase: number | null; season: number | null }> {
        const config = await this.getConfig();
        return {
            phase: config.phase,
            season: config.season,
        };
    }

    async getDiscordWebhookUrl(): Promise<string | null> {
        const config = await this.getConfig();
        return config.discordWebhookUrl;
    }

    async getPhaseStartDate(): Promise<Date | null> {
        const config = await this.getConfig();
        return config.phaseStartDate;
    }
}
