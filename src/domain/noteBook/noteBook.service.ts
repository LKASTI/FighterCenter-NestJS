import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoteBook } from 'src/domain/entities/noteBook.entity';
import { NoteBookRepository } from 'src/domain/noteBook/noteBook.repository';

@Injectable()
export class NoteBookService {
  constructor(
    @InjectRepository(NoteBookRepository)
    private readonly noteBookRepository: NoteBookRepository,
  ) {}

  /**
   * Sync notes for a user - creates or updates existing notes
   */
  public async syncNotes(
    startggUserID: string,
    data: { books: any[]; notes: { [key: string]: string } },
  ): Promise<{ success: boolean; noteBookID: string; syncedAt: Date }> {
    // For now, we'll store all notes in a single record per user
    // Title will be "My Notes" by default
    let noteBook = await this.noteBookRepository.findByUserAndTitle(
      startggUserID,
      'My Notes',
      'sf6',
    );

    if (noteBook) {
      // Update existing
      noteBook.content = data;
      noteBook.updatedAt = new Date();
      await this.noteBookRepository.save(noteBook);
    } else {
      // Create new
      noteBook = await this.noteBookRepository.createAndSave({
        startggUserID,
        title: 'My Notes',
        brand: 'sf6',
        content: data,
      });
    }

    return {
      success: true,
      noteBookID: noteBook.noteBookID,
      syncedAt: noteBook.updatedAt,
    };
  }

  /**
   * Get notes for a user
   * Returns content with updatedAt timestamp for sync comparison
   */
  public async getNotes(
    startggUserID: string,
  ): Promise<{
    books: any[];
    notes: { [key: string]: string };
    updatedAt: Date;
  } | null> {
    const noteBook = await this.noteBookRepository.findByUserAndTitle(
      startggUserID,
      'My Notes',
      'sf6',
    );

    if (!noteBook) {
      return null;
    }

    const content = noteBook.content as { books: any[]; notes: { [key: string]: string } };
    return {
      ...content,
      updatedAt: noteBook.updatedAt,
    };
  }

  /**
   * List all note books for a user (metadata only)
   */
  public async listNoteBooks(startggUserID: string): Promise<any[]> {
    const noteBooks = await this.noteBookRepository.findByUser(startggUserID);

    return noteBooks.map((nb) => ({
      id: nb.noteBookID,
      title: nb.title,
      description: nb.description,
      characterCode: nb.characterCode,
      color: nb.color,
      isPublic: nb.isPublic,
      viewCount: nb.viewCount,
      createdAt: nb.createdAt,
      updatedAt: nb.updatedAt,
    }));
  }

  /**
   * Delete notes for a user
   */
  public async deleteNotes(startggUserID: string): Promise<{ success: boolean }> {
    await this.noteBookRepository.delete({ startggUserID });
    return { success: true };
  }
}
