import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

    async uploadImage(
        buffer: Buffer,
        contentType: string = 'image/png'
    ): Promise<string> {
        // **Generate unique filename**
        const fileName = `tierlist-${uuid()}.png`;

        const command = new PutObjectCommand({
            Bucket: r2Config.bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
            // **Make publicly readable (if bucket is public)**
            // Or omit this if you configure bucket-level public access
        });

        await this.s3Client.send(command);

        // **Return the public URL**
        return `${r2Config.publicUrl}/${fileName}`;
    }
}