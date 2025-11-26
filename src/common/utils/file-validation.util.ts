import { BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Validates image file by checking both MIME type and magic bytes
 * @param file - The uploaded file (Express.Multer.File)
 * @throws BadRequestException if validation fails
 */
export async function validateImageFile(file: Express.Multer.File): Promise<void> {
    const allowedMimeTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/webp',
    ];

    // Step 1: Validate declared MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
            'Invalid file type. Only PNG, JPEG, GIF, and WebP images are allowed'
        );
    }

    // Step 2: Validate actual file content via magic bytes
    const detectedType = await fileTypeFromBuffer(file.buffer);

    if (!detectedType) {
        throw new BadRequestException(
            'Unable to determine file type. File may be corrupted or not a valid image'
        );
    }

    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    if (!allowedExtensions.includes(detectedType.ext)) {
        throw new BadRequestException(
            `File content does not match allowed image types. Detected: ${detectedType.ext}`
        );
    }

    // Step 3: Verify MIME type matches actual content
    const mimeTypeMapping: { [key: string]: string[] } = {
        'png': ['image/png'],
        'jpg': ['image/jpeg', 'image/jpg'],
        'jpeg': ['image/jpeg', 'image/jpg'],
        'gif': ['image/gif'],
        'webp': ['image/webp'],
    };

    const expectedMimeTypes = mimeTypeMapping[detectedType.ext] || [];
    if (!expectedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
            `File MIME type (${file.mimetype}) does not match actual content (${detectedType.mime})`
        );
    }
}

/**
 * Validates file size
 * @param file - The uploaded file
 * @param maxSizeInBytes - Maximum allowed file size in bytes (default: 2MB)
 * @throws BadRequestException if file exceeds size limit
 */
export function validateFileSize(file: Express.Multer.File, maxSizeInBytes: number = 2 * 1024 * 1024): void {
    if (file.size > maxSizeInBytes) {
        const maxSizeMB = (maxSizeInBytes / (1024 * 1024)).toFixed(2);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        throw new BadRequestException(
            `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
        );
    }
}
