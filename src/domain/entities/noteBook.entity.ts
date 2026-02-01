import { Column, Entity, PrimaryGeneratedColumn, BeforeUpdate } from 'typeorm';

@Entity('note_book')
export class NoteBook {
  /* Attributes */
  @PrimaryGeneratedColumn('uuid', { name: 'note_book_id' })
  noteBookID: string;

  @Column('uuid', { name: 'startgg_user_id' })
  startggUserID: string;  // Foreign key to user table (managed by auth service)

  @Column('text', { name: 'title', nullable: false })
  title: string;

  @Column('text', { name: 'description', nullable: true })
  description: string;

  @Column('text', { name: 'character_code', nullable: true })
  characterCode: string;

  @Column('varchar', { name: 'brand', length: 10, default: 'sf6' })
  brand: string;

  @Column('text', { name: 'color', nullable: true })
  color: string;

  @Column('text', { name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  // JSONB field for storing full content
  // Matches export format from notesPage.tsx:1567-1588
  // Structure: { books: Book[], notes: { [bookTitle]: string } }
  @Column('jsonb', { name: 'content', default: {} })
  content: {
    books?: any[];
    notes?: { [key: string]: string };
  };

  @Column('boolean', { name: 'is_public', default: false })
  isPublic: boolean;

  @Column('integer', { name: 'view_count', default: 0 })
  viewCount: number;

  @Column('text', { name: 'tags', array: true, default: '{}' })
  tags: string[];

  @Column('timestamptz', { name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;

  @Column('timestamptz', { name: 'updated_at', default: () => 'NOW()' })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
