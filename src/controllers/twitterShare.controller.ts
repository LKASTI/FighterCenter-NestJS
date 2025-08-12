import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import { TwitterShareService } from "../domain/twitterShare/twitterShare.service";
import { CreateTwitterShareDto } from "../dtos/twitterShare.dto";
import { Response } from "express";

//TODO rate limiting
@Controller('twitterShare')
export class TwitterShareController {
    constructor(private readonly twitterShareService: TwitterShareService) {}

    @Get('health')
    async healthCheck() {
        return { status: 'ok', message: 'TwitterShare service is running' };
    }

    @Post('create')
    async createTwitterShare(@Body() request: CreateTwitterShareDto) {
        if(!request || !request.pageUrl || !request.imageUrl) {
            throw new Error('Invalid request: pageUrl and imageUrl are required');
        }
        request.createDate = new Date();

        const twitterShareData = await this.twitterShareService.createAndSave(request);

        const shareUrl = process.env.BACKEND_URL + '/twitterShare/share/' + twitterShareData.twitterShareID;

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

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    }
}