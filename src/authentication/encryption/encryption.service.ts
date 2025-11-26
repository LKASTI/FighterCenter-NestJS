import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keys: Map<number, Buffer> = new Map();
    private currentKeyVersion: number;

    constructor(private readonly configService: ConfigService) {
        this.loadEncryptionKeys();
    }

    private loadEncryptionKeys() {
        const currentKey = this.configService.get<string>('ENCRYPTION_KEY');
        const currentVersion = parseInt(this.configService.get<string>('ENCRYPTION_KEY_VERSION'));

        // Validate current encryption key
        if (!currentKey) {
            throw new Error('ENCRYPTION_KEY is required');
        }

        // Validate hex format (must be 64 hexadecimal characters = 32 bytes)
        if (!/^[0-9a-fA-F]{64}$/.test(currentKey)) {
            throw new Error('ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes in hex)');
        }

        // Check for weak patterns (insufficient entropy)
        const keyBuffer = Buffer.from(currentKey, 'hex');
        const uniqueBytes = new Set(keyBuffer);
        if (uniqueBytes.size < 16) { // At least 16 unique bytes out of 32
            throw new Error(
                'ENCRYPTION_KEY has insufficient entropy (' + uniqueBytes.size + ' unique bytes). ' +
                'Use crypto.randomBytes(32).toString(\'hex\') to generate a strong key'
            );
        }

        // Store the validated key
        this.keys.set(currentVersion, keyBuffer);
        this.currentKeyVersion = currentVersion;

        // Load previous keys (for decryption only)
        const previousKeys = this.configService.get<string>('PREVIOUS_ENCRYPTION_KEYS');
        if (previousKeys) {
            // Format: "version:key,version:key"
            previousKeys.split(',').forEach(entry => {
                const [version, key] = entry.split(':');

                // Validate previous key format
                if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
                    throw new Error(
                        `Invalid format for previous encryption key (version ${version}). ` +
                        'Must be 64 hexadecimal characters'
                    );
                }

                this.keys.set(parseInt(version), Buffer.from(key, 'hex'));
            });
        }

    }

    /**
     * Encrypts the given text using AES-256-GCM.
     * The encrypted data includes the key version, IV, auth tag, and encrypted text.
     * Always encrypts with the current key version.
     * @param text - The plaintext to encrypt.
     * @return The encrypted text in the format "version:iv:authTag:encryptedData".
     */
    encrypt(text: string): string {
        const iv = crypto.randomBytes(16);

        const key = this.keys.get(this.currentKeyVersion);

        if (!key) {
            throw new Error('No encryption key available');
        }

        const cipher = crypto.createCipheriv(this.algorithm, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return `${this.currentKeyVersion}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypts the given encrypted text using AES-256-GCM.
     * The encrypted text must be in the format "version:iv:authTag:encryptedData".
     * It uses the key corresponding to the version specified in the encrypted text.
     * @param encryptedData - The encrypted text in the format "version:iv:authTag:encryptedData".
     */
    decrypt(encryptedData: string): string {
        try {
            const parts = encryptedData.split(':');

            // 4 parts
            let keyVersion: number;
            let iv: Buffer;
            let authTag: Buffer;
            let encrypted: string;

            if (parts.length === 4) {
                // New format with version
                keyVersion = parseInt(parts[0]);
                [iv, authTag, encrypted] = [
                    Buffer.from(parts[1], 'hex'),
                    Buffer.from(parts[2], 'hex'),
                    parts[3]
                ];
            } else {
                throw new Error('Invalid encrypted data format');
            }

            const key = this.keys.get(keyVersion);
            if (!key) {
                throw new Error(`No key available for version ${keyVersion}`);
            }

            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error(`Failed to decrypt data: ${error.message}`);
        }
    }

    /**
     * Checks if the encrypted data needs re-encryption.
     * @param encryptedData - The encrypted text in the format "version:iv:authTag:encryptedData".
     */
    needsReEncryption(encryptedData: string): boolean {
        try {
            const parts = encryptedData.split(':');
            if(parts.length !== 4) {
                throw new Error('Incorrectly formatted encrypted data');
            }
            const version = parseInt(parts[0]);
            return version !== this.currentKeyVersion;
        } catch {
            return true;
        }
    }
}