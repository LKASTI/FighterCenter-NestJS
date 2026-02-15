import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { BucklerConfigService } from "./buckler-config.service";

/** Discord embed color codes */
const COLORS = {
    RED: 0xFF0000,
    YELLOW: 0xFFCC00,
    GREEN: 0x00FF00,
};

@Injectable()
export class BucklerNotificationService {
    private readonly logger = new Logger(BucklerNotificationService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: BucklerConfigService,
    ) {}

    /**
     * Send a failure notification (red embed)
     */
    async notifyFailure(title: string, description: string): Promise<void> {
        await this.sendEmbed(title, description, COLORS.RED);
    }

    /**
     * Send a warning notification (yellow embed)
     */
    async notifyWarning(title: string, description: string): Promise<void> {
        await this.sendEmbed(title, description, COLORS.YELLOW);
    }

    /**
     * Send a success notification (green embed)
     */
    async notifySuccess(title: string, description: string): Promise<void> {
        await this.sendEmbed(title, description, COLORS.GREEN);
    }

    /**
     * Send a Discord embed via webhook.
     * Fire-and-forget: webhook failures are logged but never block the caller.
     */
    private async sendEmbed(title: string, description: string, color: number): Promise<void> {
        try {
            const webhookUrl = await this.configService.getDiscordWebhookUrl();

            if (!webhookUrl) {
                return;
            }

            await firstValueFrom(
                this.httpService.post(webhookUrl, {
                    embeds: [
                        {
                            title,
                            description,
                            color,
                            timestamp: new Date().toISOString(),
                            footer: {
                                text: "FighterCenter Buckler Scraper",
                            },
                        },
                    ],
                }),
            );
        } catch (error) {
            this.logger.warn(
                `Failed to send Discord notification: ${error.message}`,
            );
        }
    }
}
