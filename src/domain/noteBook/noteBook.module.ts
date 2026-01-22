import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteBook } from 'src/domain/entities/noteBook.entity';
import { NoteBookRepository } from 'src/domain/noteBook/noteBook.repository';
import { NoteBookService } from 'src/domain/noteBook/noteBook.service';
import { NoteBookController } from 'src/controllers/noteBook.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NoteBook])],
  providers: [NoteBookService, NoteBookRepository],
  controllers: [NoteBookController],
  exports: [NoteBookService],
})
export class NoteBookModule {}
