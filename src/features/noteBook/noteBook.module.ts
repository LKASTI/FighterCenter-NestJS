import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteBook } from 'src/domain/entities/noteBook.entity';
import { NoteBookRepository } from './noteBook.repository';
import { NoteBookService } from './noteBook.service';
import { NoteBookController } from './noteBook.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NoteBook])],
  providers: [NoteBookService, NoteBookRepository],
  controllers: [NoteBookController],
  exports: [NoteBookService],
})
export class NoteBookModule {}
