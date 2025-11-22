import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtRefreshToken } from '@entities/jwtRefreshToken.entity';
import { JwtRefreshTokenService } from './services/jwt-refresh-token.service';
import { JwtRefreshTokenCleanupService } from './services/jwt-refresh-token-cleanup.service';
import { EncryptionModule } from '@authentication/encryption/encryption.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([JwtRefreshToken]),
        EncryptionModule,
    ],
    providers: [JwtRefreshTokenService, JwtRefreshTokenCleanupService],
    exports: [JwtRefreshTokenService],
})
export class JwtRefreshTokenModule {}
