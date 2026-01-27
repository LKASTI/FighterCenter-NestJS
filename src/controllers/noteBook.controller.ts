import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwtAuth.guard';
import { NoteBookService } from 'src/domain/noteBook/noteBook.service';
import { SyncNotesDTO } from 'src/dtos/noteBook.dto';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NoteBookController {
  constructor(private readonly noteBookService: NoteBookService) {}

  /**
   * Helper to validate user has startggUserID in their token
   */
  private validateUserSession(req: any): string {
    const startggUserID = req.user?.startggUserID;
    if (!startggUserID) {
      throw new UnauthorizedException(
        'Your session is missing required user information. Please log out and log back in to refresh your session.',
      );
    }
    return startggUserID;
  }

  /**
   * POST /api/notes/sync
   * Upload/sync complete notes backup
   */
  @Post('sync')
  @HttpCode(HttpStatus.CREATED)
  async syncNotes(@Req() req, @Body() syncNotesDto: SyncNotesDTO) {
    const startggUserID = this.validateUserSession(req);
    return await this.noteBookService.syncNotes(startggUserID, syncNotesDto);
  }

  /**
   * GET /api/notes/sync
   * Download complete notes backup
   */
  @Get('sync')
  async getNotes(@Req() req) {
    const startggUserID = this.validateUserSession(req);
    return await this.noteBookService.getNotes(startggUserID);
  }

  /**
   * GET /api/notes/books
   * List user's books (metadata only)
   */
  @Get('books')
  async listNoteBooks(@Req() req) {
    const startggUserID = this.validateUserSession(req);
    const books = await this.noteBookService.listNoteBooks(startggUserID);
    return { books };
  }

  /**
   * DELETE /api/notes/sync
   * Delete cloud backup
   */
  @Delete('sync')
  async deleteNotes(@Req() req) {
    const startggUserID = this.validateUserSession(req);
    return await this.noteBookService.deleteNotes(startggUserID);
  }
}
