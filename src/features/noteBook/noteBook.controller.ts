import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NoteBookService } from './noteBook.service';
import { SyncNotesDTO } from '@dtos/noteBook.dto';
import {
  SyncNotesResponseDTO,
  GetNotesResponseDTO,
  ListNoteBooksResponseDTO,
  DeleteNotesResponseDTO,
} from '@dtos/noteBook.response.dto';
import {
  ApiNoteBookPost,
  ApiNoteBookGet,
  ApiNoteBookDelete,
} from './decorators/note-book-swagger.decorators';
import { validateUserSession } from '@authentication/utils';

@Controller('notes')
export class NoteBookController {
  constructor(private readonly noteBookService: NoteBookService) {}

  /**
   * POST /api/notes/sync
   * Upload/sync complete notes backup
   */
  @Post('sync')
  @ApiNoteBookPost('Sync notes to cloud', SyncNotesResponseDTO)
  @HttpCode(HttpStatus.CREATED)
  async syncNotes(@Req() req, @Body() syncNotesDto: SyncNotesDTO) {
    const startggUserID = validateUserSession(req);
    return await this.noteBookService.syncNotes(startggUserID, syncNotesDto);
  }

  /**
   * GET /api/notes/sync
   * Download complete notes backup
   */
  @Get('sync')
  @ApiNoteBookGet('Get notes from cloud', GetNotesResponseDTO)
  async getNotes(@Req() req) {
    const startggUserID = validateUserSession(req);
    return await this.noteBookService.getNotes(startggUserID);
  }

  /**
   * GET /api/notes/books
   * List user's books (metadata only)
   */
  @Get('books')
  @ApiNoteBookGet('List all notebooks', ListNoteBooksResponseDTO)
  async listNoteBooks(@Req() req) {
    const startggUserID = validateUserSession(req);
    const books = await this.noteBookService.listNoteBooks(startggUserID);
    return { books };
  }

  /**
   * DELETE /api/notes/sync
   * Delete cloud backup
   */
  @Delete('sync')
  @ApiNoteBookDelete('Delete notes from cloud', DeleteNotesResponseDTO)
  async deleteNotes(@Req() req) {
    const startggUserID = validateUserSession(req);
    return await this.noteBookService.deleteNotes(startggUserID);
  }
}
