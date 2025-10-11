import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Config } from '../../../config/r2.config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class R2UploadService {
    private s3Client: S3Client;

    constructor() {
        // **Key part: R2 uses S3-compatible API**
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: r2Config.accessKeyId,
                secretAccessKey: r2Config.secretAccessKey,
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
            Bucket: r2Config.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });

        await this.s3Client.send(command);
        return `${r2Config.publicUrl}/${key}`;
    }

    async deleteFile(folderPrefix: string, filePath: string): Promise<void> {
        const key = `${folderPrefix}${filePath}`;

        try {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: r2Config.bucketName,
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