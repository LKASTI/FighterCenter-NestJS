import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtRefreshToken } from '../entities/jwtRefreshToken.entity';
import { JwtRefreshTokenService } from './jwtRefreshToken.service';
import { EncryptionModule } from '../../authentication/encryption/encryption.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([JwtRefreshToken]),
        EncryptionModule,
    ],
    providers: [JwtRefreshTokenService],
    exports: [JwtRefreshTokenService],
})
export class JwtRefreshTokenModule {}
