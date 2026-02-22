import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class R2TierlistService {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly publicUrl: string;

    constructor(private readonly configService: ConfigService) {
        const accountId = this.configService.getOrThrow<string>('CLOUDFLARE_ACCOUNT_ID');
        this.bucketName = this.configService.getOrThrow<string>('R2_TIERLIST_BUCKET_NAME');
        this.publicUrl = this.configService.getOrThrow<string>('R2_TIERLIST_PUBLIC_URL');

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: this.configService.getOrThrow<string>('R2_TIERLIST_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.getOrThrow<string>('R2_TIERLIST_SECRET_ACCESS_KEY'),
            },
        });
    }

    async uploadTierlistImage(buffer: Buffer, contentType: string = 'image/png'): Promise<string> {
        const key = `tierlists/tierlist-${uuid()}.png`;

        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));

        return `${this.publicUrl}/${key}`;
    }
}
