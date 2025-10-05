import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { TwitterShareService } from "../features/twitterShare/twitterShare.service";
import { CreateTwitterShareDto } from "../dtos/twitterShare.dto";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { R2UploadService } from "../features/twitterShare/r2/r2-upload.service";
import { Throttle } from "@nestjs/throttler";

//TODO rate limiting
@Controller('twitterShare')
export class TwitterShareController {
    constructor(
        private readonly twitterShareService: TwitterShareService,
        private readonly r2UploadService: R2UploadService
    ) {}

    @Get('health')
    async healthCheck() {
        return { status: 'ok', message: 'TwitterShare service is running' };
    }

    @Post('upload-image')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @UseInterceptors(
        FileInterceptor('image',
            {
                limits: {
                    fileSize: 1 * 1024 * 1024, // 1 MB file size limit
                    files: 1
                },
                fileFilter: (req, file, callback) => {
                    // Only allow specific image types
                    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

                    if (!allowedMimeTypes.includes(file.mimetype)) {
                        return callback(
                            new BadRequestException('Only PNG, JPEG, and GIF images are allowed'),
                            false
                        );
                    }

                    callback(null, true);
                }
            }
        )
    )
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No image file provided');
        }

        // **Upload to R2 and get public URL**
        const imageUrl = await this.r2UploadService.uploadImage(
            file.buffer,
            file.mimetype
        );

        return { imageUrl };
    }

    @Post('create')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async createTwitterShare(@Body() request: CreateTwitterShareDto) {
        if(!request || !request.pageUrl || !request.imageUrl) {
            throw new Error('Invalid request: pageUrl and imageUrl are required');
        }

        request.createDate = new Date();
        const twitterShareData = await this.twitterShareService.createAndSave(request);
        const publicUrl = process.env.NODE_ENV !== 'production'? process.env.BACKEND_URL : process.env.FRONTEND_URL + '/api';
        const shareUrl = publicUrl + '/twitterShare/share/' + twitterShareData.twitterShareID;

        return shareUrl;
    }

    @Get('share/:twitterShareId')
    async getTwitterSharePage(@Param('twitterShareId') sharedId: string, @Res() res: Response) {
        if(!sharedId) {
            throw new Error('Invalid request: shareId is required');
        }

        const twitterShareData = await this.twitterShareService.findById(sharedId);

        if(!twitterShareData) {
            throw new Error('Twitter share not found');
        }

        const title = twitterShareData.title || 'FighterCenter Post';
        const description = twitterShareData.description || 'Check out FighterCenter';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <!-- Twitter Card meta tags -->
              <meta name="twitter:card" content="summary_large_image">
              <meta name="twitter:title" content=${title}>
              <meta name="twitter:description" content=${description}>
              <meta name="twitter:image" content="${twitterShareData.imageUrl}">
              
              <!-- Redirect to the original React page -->
              <script>
                window.location.href = '${twitterShareData.pageUrl}';
              </script>
            </head>
            <body>
              <h1>Loading...</h1>
              <p>If you're not redirected, <a href="${twitterShareData.pageUrl}">click here</a></p>
            </body>
            </html>
        `
        console.log("Twitter read share page for ID:", sharedId);
        console.log(html);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    }
}