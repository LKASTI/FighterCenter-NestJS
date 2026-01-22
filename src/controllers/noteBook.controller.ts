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
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwtAuth.guard';
import { NoteBookService } from 'src/domain/noteBook/noteBook.service';
import { SyncNotesDTO } from 'src/dtos/noteBook.dto';

@Controller('api/notes')
@UseGuards(JwtAuthGuard)
export class NoteBookController {
  constructor(private readonly noteBookService: NoteBookService) {}

  /**
   * POST /api/notes/sync
   * Upload/sync complete notes backup
   */
  @Post('sync')
  @HttpCode(HttpStatus.CREATED)
  async syncNotes(@Req() req, @Body() syncNotesDto: SyncNotesDTO) {
    const startggUserID = req.user.startggUserID;
    return await this.noteBookService.syncNotes(startggUserID, syncNotesDto);
  }

  /**
   * GET /api/notes/sync
   * Download complete notes backup
   */
  @Get('sync')
  async getNotes(@Req() req) {
    const startggUserID = req.user.startggUserID;
    return await this.noteBookService.getNotes(startggUserID);
  }

  /**
   * GET /api/notes/books
   * List user's books (metadata only)
   */
  @Get('books')
  async listNoteBooks(@Req() req) {
    const startggUserID = req.user.startggUserID;
    const books = await this.noteBookService.listNoteBooks(startggUserID);
    return { books };
  }

  /**
   * DELETE /api/notes/sync
   * Delete cloud backup
   */
  @Delete('sync')
  async deleteNotes(@Req() req) {
    const startggUserID = req.user.startggUserID;
    return await this.noteBookService.deleteNotes(startggUserID);
  }
}
