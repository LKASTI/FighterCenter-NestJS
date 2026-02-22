import { Injectable } from '@nestjs/common';
import { R2ImagesService } from '@common/r2/r2-images.service';
import { FileNamingService } from '@common/services/file-naming.service';

@Injectable()
export class TournamentGraphicUploadService {
  private readonly FOLDER_PREFIX = 'tournament-series-graphics/';

  constructor(
    private readonly r2ImagesService: R2ImagesService,
    private readonly fileNamingService: FileNamingService
  ) {}

  async uploadGraphic(
    seriesName: string,
    seriesId: number,
    startggUrl: string,
    file: Express.Multer.File,
    isGenerated: boolean = true
  ): Promise<string> {
    // Step 1: Generate full path (directory + filename)
    const filePath = this.fileNamingService.generateTop8GraphicPath(
      seriesName,
      seriesId,
      startggUrl,
      isGenerated,
      file.mimetype
    );

    // Step 2: Delete existing graphic with same name (if any)
    await this.r2ImagesService.deleteFile(this.FOLDER_PREFIX, filePath);

    // Step 3: Upload to R2
    const imageUrl = await this.r2ImagesService.uploadImageWithOptions(
      file.buffer,
      filePath,
      {
        contentType: file.mimetype,
        folderPrefix: this.FOLDER_PREFIX
      }
    );

    return imageUrl;
  }
}
