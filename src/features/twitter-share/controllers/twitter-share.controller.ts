import { Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors, Logger } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TwitterShareService } from "../services/twitter-share.service";
import { CreateTwitterShareDto } from "../dtos/request/create-twitter-share.dto";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { R2UploadService } from "../services/r2/r2-upload.service";
import { imageUploadConfig } from "@common/interceptors/image-upload.config";
import { ApiTwitterShareGet, ApiTwitterSharePost, ApiTwitterShareUpload } from "../decorators/twitter-share-swagger.decorators";
import { validateImageFile } from "@common/utils/file-validation.util";

@ApiTags("Twitter Share")
@Controller('twitterShare')
export class TwitterShareController {
    private readonly logger = new Logger(TwitterShareController.name);

    constructor(
        private readonly twitterShareService: TwitterShareService,
        private readonly r2UploadService: R2UploadService
    ) {}

    @Get('health')
    @ApiTwitterShareGet("Health check for Twitter Share service")
    async healthCheck() {
        return { status: 'ok', message: 'TwitterShare service is running' };
    }

    @Post('upload-image')
    @ApiTwitterShareUpload("Upload an image for Twitter card")
    @UseInterceptors(FileInterceptor('image', imageUploadConfig))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No image file provided');
        }

        // Validate file content via magic bytes (defense in depth)
        await validateImageFile(file);

        const imageUrl = await this.r2UploadService.uploadTierlistImage(
            file.buffer,
            file.mimetype
        );

        return { imageUrl };
    }

    @Post('create')
    @ApiTwitterSharePost("Create a new Twitter share with meta tags")
    async createTwitterShare(@Body() request: CreateTwitterShareDto) {
        if(!request || !request.pageUrl || !request.imageUrl) {
            throw new Error('Invalid request: pageUrl and imageUrl are required');
        }
        const proxyPrefix = process.env.IS_PREVIEW? '/api-preview' : '/api';
        request.createDate = new Date();
        const twitterShareData = await this.twitterShareService.createAndSave(request);
        const publicUrl = process.env.NODE_ENV !== 'production'? process.env.BACKEND_URL : process.env.FRONTEND_URL + proxyPrefix;
        const shareUrl = publicUrl + '/twitterShare/share/' + twitterShareData.twitterShareID;

        return shareUrl;
    }

    @Get('share/:twitterShareId')
    @ApiTwitterShareGet("Get Twitter share page with meta tags and redirect")
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
        this.logger.debug("Twitter read share page for ID:", sharedId);
        this.logger.debug(html);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    }
}
