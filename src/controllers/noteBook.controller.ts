import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { NoteBookService } from 'src/domain/noteBook/noteBook.service';
import { SyncNotesDTO } from 'src/dtos/noteBook.dto';
import {
  ApiNoteBookPost,
  ApiNoteBookGet,
  ApiNoteBookDelete,
} from 'src/features/noteBook/decorators/note-book-swagger.decorators';

@Controller('notes')
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
  @ApiNoteBookPost('Sync notes to cloud')
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
  @ApiNoteBookGet('Get notes from cloud')
  async getNotes(@Req() req) {
    const startggUserID = this.validateUserSession(req);
    return await this.noteBookService.getNotes(startggUserID);
  }

  /**
   * GET /api/notes/books
   * List user's books (metadata only)
   */
  @Get('books')
  @ApiNoteBookGet('List all notebooks')
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
  @ApiNoteBookDelete('Delete notes from cloud')
  async deleteNotes(@Req() req) {
    const startggUserID = this.validateUserSession(req);
    return await this.noteBookService.deleteNotes(startggUserID);
  }
}
