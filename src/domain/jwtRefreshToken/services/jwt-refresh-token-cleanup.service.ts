import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtRefreshToken } from '@entities/jwtRefreshToken.entity';

@Injectable()
export class JwtRefreshTokenCleanupService {
    private readonly logger = new Logger(JwtRefreshTokenCleanupService.name);
    private lastCleanupStats = {
        expiredTokens: { count: 0, timestamp: null as Date | null, duration: 0 },
        revokedTokens: { count: 0, timestamp: null as Date | null, duration: 0 },
    };

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
        const startTime = Date.now();
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        try {
            const result = await this.jwtRefreshTokenRepo
                .createQueryBuilder()
                .delete()
                .where('expires_at < :thirtyDaysAgo', { thirtyDaysAgo })
                .execute();

            const duration = Date.now() - startTime;
            const count = result.affected || 0;

            // Store stats for health check endpoint
            this.lastCleanupStats.expiredTokens = {
                count,
                timestamp: new Date(),
                duration,
            };

            // Log success with details
            this.logger.log(
                `✅ Cleaned up ${count} expired refresh tokens in ${duration}ms`
            );

            // Alert if cleanup takes too long (potential performance issue)
            if (duration > 5000) {
                this.logger.warn(
                    `⚠️  Cleanup took ${duration}ms - consider adding database indexes or optimizing query`
                );
            }

            // Alert if unusually high number of tokens cleaned
            if (count > 10000) {
                this.logger.warn(
                    `⚠️  Cleaned up ${count} tokens - unusually high, investigate token creation patterns`
                );
            }
        } catch (error) {
            this.logger.error('❌ Failed to cleanup expired tokens', error.stack || error);
        }
    }

    /**
     * Clean up revoked refresh tokens
     * Runs daily at 4:00 AM
     * Deletes revoked tokens older than 7 days
     */
    @Cron(CronExpression.EVERY_DAY_AT_4AM)
    async cleanupRevokedTokens() {
        const startTime = Date.now();
        const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

        try {
            const result = await this.jwtRefreshTokenRepo
                .createQueryBuilder()
                .delete()
                .where('is_revoked = :isRevoked', { isRevoked: true })
                .andWhere('created_at < :sevenDaysAgo', { sevenDaysAgo })
                .execute();

            const duration = Date.now() - startTime;
            const count = result.affected || 0;

            // Store stats for health check endpoint
            this.lastCleanupStats.revokedTokens = {
                count,
                timestamp: new Date(),
                duration,
            };

            // Log success with details
            this.logger.log(
                `✅ Cleaned up ${count} revoked refresh tokens in ${duration}ms`
            );

            // Alert if cleanup takes too long
            if (duration > 5000) {
                this.logger.warn(
                    `⚠️  Cleanup took ${duration}ms - consider adding database indexes or optimizing query`
                );
            }

            // Alert if unusually high number of revoked tokens
            if (count > 5000) {
                this.logger.warn(
                    `⚠️  Cleaned up ${count} revoked tokens - unusually high, investigate logout patterns`
                );
            }
        } catch (error) {
            this.logger.error('❌ Failed to cleanup revoked tokens', error.stack || error);
        }
    }

    /**
     * Get cleanup statistics for health check endpoint
     */
    getCleanupStats() {
        return this.lastCleanupStats;
    }
}
