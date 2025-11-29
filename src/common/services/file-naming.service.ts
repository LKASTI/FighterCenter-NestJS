import { Injectable } from '@nestjs/common';

interface ParsedStartGGUrl {
  tournamentSlug: string;
  eventSlug: string;
}

@Injectable()
export class FileNamingService {
  generateTop8GraphicPath(
    seriesName: string,
    seriesId: number,
    startggUrl: string,
    isGenerated: boolean,
    mimeType: string
  ): string {
    const directoryName = this.generateSeriesDirectoryName(seriesName, seriesId);
    const fileName = this.generateTop8GraphicFilename(startggUrl, isGenerated, mimeType);
    return `${directoryName}${fileName}`;
  }

  generateSeriesDirectoryName(seriesName: string, seriesId: number): string {
    const sanitizedName = this.sanitizeForFilename(seriesName);
    return `series-${sanitizedName}-${seriesId}/`;
  }

  generateTop8GraphicFilename(
    startggUrl: string,
    isGenerated: boolean,
    mimeType: string
  ): string {
    const { tournamentSlug, eventSlug } = this.parseStartGGUrl(startggUrl);
    const suffix = isGenerated ? 'generated' : 'custom';
    const extension = this.getExtensionFromMimeType(mimeType);
    return `${tournamentSlug}-${eventSlug}-top8graphic-${suffix}.${extension}`;
  }

  parseStartGGUrl(startggUrl: string): ParsedStartGGUrl {
    const path = startggUrl.replace(/https?:\/\/(www\.)?start\.gg\//i, '');

    const tournamentMatch = path.match(/tournament\/([^\/]+)/);
    const tournamentSlug = tournamentMatch ? tournamentMatch[1] : null;

    const eventMatch = path.match(/event\/([^\/]+)/);
    const eventSlug = eventMatch ? eventMatch[1] : null;

    return {
      tournamentSlug: this.sanitizeForFilename(tournamentSlug || 'unknown'),
      eventSlug: this.sanitizeForFilename(eventSlug || 'unknown'),
    };
  }

  /**
   * Sanitizes a string for safe use in filenames
   * Prevents path traversal attacks and file system issues
   * @param input - The string to sanitize
   * @param maxLength - Maximum length of the sanitized string (default: 50)
   * @returns Sanitized filename-safe string
   */
  sanitizeForFilename(input: string, maxLength: number = 50): string {
    return input
      .toLowerCase()
      // Remove path separators (/, \) and parent directory references (..)
      .replace(/[\/\\]/g, '')
      .replace(/\.{2,}/g, '.')
      // Replace special characters and whitespace with dash
      .replace(/[^a-z0-9.-]+/g, '-')
      // Remove consecutive dashes
      .replace(/-+/g, '-')
      // Remove leading/trailing dashes and dots
      .replace(/^[-.]|[-.]$/g, '')
      // Limit length
      .substring(0, maxLength);
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    return mimeToExt[mimeType] || 'png';
  }
}
