import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const imageUploadConfig: MulterOptions = {
  limits: {
    fileSize: 1 * 1024 * 1024, // 1 MB
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
