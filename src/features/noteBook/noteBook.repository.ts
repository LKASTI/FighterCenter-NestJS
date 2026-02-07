import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteBook } from 'src/domain/entities/noteBook.entity';

export class NoteBookRepository extends Repository<NoteBook> {
  constructor(
    @InjectRepository(NoteBook)
    private noteBookRepository: Repository<NoteBook>,
  ) {
    super(
      noteBookRepository.target,
      noteBookRepository.manager,
      noteBookRepository.queryRunner,
    );
  }

  public async findByUser(userId: string): Promise<NoteBook[]> {
    return this.noteBookRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  public async findByUserAndTitle(
    userId: string,
    title: string,
    brand: string = 'sf6',
  ): Promise<NoteBook | null> {
    return this.noteBookRepository.findOne({
      where: { userId, title, brand },
    });
  }

  public async createAndSave(noteBookData: Partial<NoteBook>): Promise<NoteBook> {
    try {
      const newNoteBook = this.noteBookRepository.create(noteBookData);
      return await this.noteBookRepository.save(newNoteBook);
    } catch (error) {
      console.error('Error in noteBook createAndSave:', error);
      throw error;
    }
  }
}
