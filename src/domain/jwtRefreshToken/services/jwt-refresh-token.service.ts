import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtRefreshToken } from '@entities/jwtRefreshToken.entity';
import { EncryptionService } from '@authentication/encryption/encryption.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshTokenService {
    private readonly logger = new Logger(JwtRefreshTokenService.name);

    constructor(
        @InjectRepository(JwtRefreshToken)
        private readonly jwtRefreshTokenRepo: Repository<JwtRefreshToken>,
        private readonly encryptionService: EncryptionService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Create a new JWT refresh token
     * Similar to how Start.gg tokens are stored
     */
    async createRefreshToken(
        startggUserID: string,
        userAgent?: string,
    ): Promise<{ plainToken: string; dbToken: JwtRefreshToken }> {
        // Generate random token (similar to Start.gg OAuth tokens)
        const plainToken = crypto.randomBytes(64).toString('hex');

        // Create hash for fast lookup
        const tokenHash = crypto
            .createHash('sha256')
            .update(plainToken)
            .digest('hex');

        // Encrypt using existing EncryptionService
        const encryptedToken = this.encryptionService.encrypt(plainToken);

        // Calculate expiration (7 days)
        const expirationDuration = parseInt(
            this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '604800'
        );
        const expiresAt = Date.now() + (expirationDuration * 1000);

        const refreshToken = this.jwtRefreshTokenRepo.create({
            tokenHash,
            encryptedToken,
            startggUserID,
            expiresAt,
            userAgent,
        });

        const dbToken = await this.jwtRefreshTokenRepo.save(refreshToken);

        // Return plain token (sent to client) and DB record
        return { plainToken, dbToken };
    }

    /**
     * Validate refresh token with optional session binding
     * Uses hash for fast lookup, then verifies with decryption
     * @param plainToken - The refresh token to validate
     * @param userAgent - Optional user agent for session binding validation
     */
    async validateRefreshToken(
        plainToken: string,
        userAgent?: string,
    ): Promise<JwtRefreshToken | null> {
        // Hash the incoming token for lookup
        const tokenHash = crypto
            .createHash('sha256')
            .update(plainToken)
            .digest('hex');

        // Find by hash - fast lookup with index
        const dbToken = await this.jwtRefreshTokenRepo.findOne({
            where: {
                tokenHash,
                isRevoked: false,
            },
            relations: ['user'],
        });

        if (!dbToken) {
            return null;  // Token not found or revoked
        }

        // Check expiration
        if (dbToken.expiresAt < Date.now()) {
            return null;  // Expired
        }

        // Verify encrypted token matches (extra security layer)
        try {
            const decryptedToken = this.encryptionService.decrypt(dbToken.encryptedToken);
            if (decryptedToken !== plainToken) {
                return null;  // Token mismatch
            }
        } catch (error) {
            this.logger.error('Failed to decrypt refresh token:', error);
            return null;  // Decryption failed
        }

        // Session binding validation (if context provided)
        if (userAgent && dbToken.userAgent && dbToken.userAgent !== userAgent) {
            this.logger.warn(
                `User agent mismatch for refresh token ${dbToken.jwtRefreshTokenID}. ` +
                `Expected: ${dbToken.userAgent}, Got: ${userAgent}`
            );
            // In strict mode, we could revoke the token here
            // For now, log the warning and allow (can be tightened later)
        }

        // Update last used timestamp
        dbToken.lastUsedAt = Date.now();
        await this.jwtRefreshTokenRepo.save(dbToken);

        return dbToken;
    }

    /**
     * Revoke a single refresh token
     */
    async revokeToken(tokenId: string): Promise<void> {
        await this.jwtRefreshTokenRepo.update(tokenId, { isRevoked: true });
    }

    /**
     * Revoke all tokens for a user (logout all devices)
     */
    async revokeAllUserTokens(startggUserID: string): Promise<void> {
        await this.jwtRefreshTokenRepo.update(
            { startggUserID, isRevoked: false },
            { isRevoked: true }
        );
    }

    /**
     * Clean up expired tokens (periodic maintenance)
     */
    async cleanupExpiredTokens(): Promise<void> {
        const now = Date.now();
        await this.jwtRefreshTokenRepo
            .createQueryBuilder()
            .delete()
            .where('expires_at < :now', { now })
            .execute();
    }
}
