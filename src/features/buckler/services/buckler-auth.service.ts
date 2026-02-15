import { Injectable, Logger } from "@nestjs/common";
import { BucklerConfigService } from "./buckler-config.service";

@Injectable()
export class BucklerAuthService {
    private readonly logger = new Logger(BucklerAuthService.name);

    constructor(
        private readonly configService: BucklerConfigService,
    ) {}

    /**
     * Get cookies for Buckler requests.
     *
     * Returns the cookie key-value pairs needed for authenticated
     * Buckler API requests. Currently reads from the database config.
     *
     * To switch to automated login in the future, replace the internals
     * of this method while keeping the same interface.
     *
     * @returns Cookie record, or null if cookies are not configured
     */
    async getCookies(): Promise<Record<string, string> | null> {
        const { bucklerId, bucklerRId, bucklerPraiseDate } = await this.configService.getCookies();

        if (!bucklerId || !bucklerRId) {
            this.logger.warn("Buckler cookies not configured in sf6_buckler_config");
            return null;
        }

        const cookies: Record<string, string> = {
            buckler_id: bucklerId,
            buckler_r_id: bucklerRId,
        };

        if (bucklerPraiseDate) {
            cookies.buckler_praise_date = bucklerPraiseDate;
        }

        return cookies;
    }
}
