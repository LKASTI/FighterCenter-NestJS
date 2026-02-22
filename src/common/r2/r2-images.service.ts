import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2ImagesService {
    private readonly logger = new Logger(R2ImagesService.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly publicUrl: string;

    constructor(private readonly configService: ConfigService) {
        const accountId = this.configService.getOrThrow<string>('CLOUDFLARE_ACCOUNT_ID');
        this.bucketName = this.configService.getOrThrow<string>('R2_IMAGES_BUCKET_NAME');
        this.publicUrl = this.configService.getOrThrow<string>('R2_IMAGES_PUBLIC_URL');

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: this.configService.getOrThrow<string>('R2_IMAGES_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.getOrThrow<string>('R2_IMAGES_SECRET_ACCESS_KEY'),
            },
        });
    }

    async uploadImageWithOptions(
        buffer: Buffer,
        filePath: string,
        options?: { contentType?: string; folderPrefix?: string }
    ): Promise<string> {
        const folderPrefix = options?.folderPrefix ?? '';
        const contentType = options?.contentType ?? 'image/png';
        const key = `${folderPrefix}${filePath}`;

        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));

        return `${this.publicUrl}/${key}`;
    }

    async deleteFile(folderPrefix: string, filePath: string): Promise<void> {
        const key = `${folderPrefix}${filePath}`;
        try {
            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }));
        } catch {
            this.logger.log(`File ${key} not found or already deleted`);
        }
    }
}
