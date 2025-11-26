import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * Multer configuration for image uploads
 *
 * SECURITY NOTE: This configuration provides initial validation only.
 * Controllers MUST also call validateImageFile() from file-validation.util.ts
 * to verify actual file content via magic bytes.
 */
export const imageUploadConfig: MulterOptions = {
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Only PNG, JPEG, GIF, and WebP images are allowed'
        ),
        false
      );
    }

    callback(null, true);
  },
};
