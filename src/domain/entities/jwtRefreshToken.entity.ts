import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity("jwt_refresh_token")
export class JwtRefreshToken {
    @PrimaryGeneratedColumn("uuid", { name: "jwt_refresh_token_id" })
    jwtRefreshTokenID: string;

    @Column("varchar", { name: "token_hash", length: 64, unique: true })
    tokenHash: string;  // SHA256 hash for fast lookup

    @Column("text", { name: "encrypted_token" })
    encryptedToken: string;  // Encrypted using EncryptionService

    @Column("uuid", { name: "startgg_user_id" })
    startggUserID: string;  // Foreign key to user table (managed by auth service)

    @Column("bigint", {
        name: "expires_at",
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseInt(value, 10)
        }
    })
    expiresAt: number;  // Timestamp in milliseconds

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @Column("bigint", {
        name: "last_used_at",
        nullable: true,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => value ? parseInt(value, 10) : null
        }
    })
    lastUsedAt: number;  // Timestamp in milliseconds

    @Column("boolean", { name: "is_revoked", default: false })
    isRevoked: boolean;

    @Column("varchar", { name: "user_agent", length: 500, nullable: true })
    userAgent: string;
}
