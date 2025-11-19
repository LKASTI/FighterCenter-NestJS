import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class R2UploadService {
    private s3Client: S3Client;
    private bucketName: string;
    private publicUrl: string;

    constructor(private configService: ConfigService) {
        // **Key part: R2 uses S3-compatible API**
        const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
        const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
        this.bucketName = this.configService.get<string>('R2_BUCKET_NAME');
        this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

        if (!this.bucketName) {
            throw new Error('R2_BUCKET_NAME environment variable is not set');
        }

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    async uploadImageWithOptions(
        buffer: Buffer,
        filePath: string,
        options?: {
            contentType?: string;
            folderPrefix?: string;
        }
    ): Promise<string> {
        const folderPrefix = options?.folderPrefix || '';
        const contentType = options?.contentType || 'image/png';
        const key = `${folderPrefix}${filePath}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });

        await this.s3Client.send(command);
        return `${this.publicUrl}/${key}`;
    }

    async deleteFile(folderPrefix: string, filePath: string): Promise<void> {
        const key = `${folderPrefix}${filePath}`;

        try {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(deleteCommand);
        } catch (error) {
            console.log(`File ${key} not found or already deleted`);
        }
    }

    async uploadTierlistImage(
        buffer: Buffer,
        contentType: string = 'image/png'
    ): Promise<string> {
        const fileName = `tierlist-${uuid()}.png`;
        return this.uploadImageWithOptions(buffer, fileName, {
            contentType,
            folderPrefix: 'tierlists/',
        });
    }
}