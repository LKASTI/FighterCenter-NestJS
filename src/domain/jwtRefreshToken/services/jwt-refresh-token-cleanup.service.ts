import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtRefreshToken } from '@entities/jwtRefreshToken.entity';

@Injectable()
export class JwtRefreshTokenCleanupService {
    private readonly logger = new Logger(JwtRefreshTokenCleanupService.name);

    constructor(
        @InjectRepository(JwtRefreshToken)
        private readonly jwtRefreshTokenRepo: Repository<JwtRefreshToken>,
    ) {}

    /**
     * Clean up expired refresh tokens
     * Runs daily at 3:00 AM
     * Deletes tokens that expired more than 30 days ago
     */
    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async cleanupExpiredTokens() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        try {
            const result = await this.jwtRefreshTokenRepo
                .createQueryBuilder()
                .delete()
                .where('expires_at < :thirtyDaysAgo', { thirtyDaysAgo })
                .execute();

            this.logger.log(`Cleaned up ${result.affected || 0} expired refresh tokens`);
        } catch (error) {
            this.logger.error('Failed to cleanup expired tokens', error);
        }
    }

    /**
     * Clean up revoked refresh tokens
     * Runs daily at 4:00 AM
     * Deletes revoked tokens older than 7 days
     */
    @Cron(CronExpression.EVERY_DAY_AT_4AM)
    async cleanupRevokedTokens() {
        const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

        try {
            const result = await this.jwtRefreshTokenRepo
                .createQueryBuilder()
                .delete()
                .where('is_revoked = :isRevoked', { isRevoked: true })
                .andWhere('created_at < :sevenDaysAgo', { sevenDaysAgo })
                .execute();

            this.logger.log(`Cleaned up ${result.affected || 0} revoked refresh tokens`);
        } catch (error) {
            this.logger.error('Failed to cleanup revoked tokens', error);
        }
    }
}
