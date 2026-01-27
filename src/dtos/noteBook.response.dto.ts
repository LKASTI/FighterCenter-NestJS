import { ApiProperty } from '@nestjs/swagger';

export class NoteBookMetadataDTO {
  @ApiProperty({
    description: 'Unique identifier for the notebook',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the notebook',
    example: 'My Notes',
  })
  title: string;

  @ApiProperty({
    description: 'Optional description',
    example: 'My personal notes collection',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Character code if associated with a character',
    example: 'ryu',
    nullable: true,
  })
  characterCode: string | null;

  @ApiProperty({
    description: 'Color theme for the notebook',
    example: '#ff0000',
    nullable: true,
  })
  color: string | null;

  @ApiProperty({
    description: 'Whether the notebook is publicly visible',
    example: false,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Number of times the notebook has been viewed',
    example: 42,
  })
  viewCount: number;

  @ApiProperty({
    description: 'When the notebook was created',
    example: '2025-01-27T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the notebook was last updated',
    example: '2025-01-27T15:30:00.000Z',
  })
  updatedAt: Date;
}

export class ListNoteBooksResponseDTO {
  @ApiProperty({
    description: 'Array of notebook metadata',
    type: [NoteBookMetadataDTO],
  })
  books: NoteBookMetadataDTO[];
}

export class GetNotesResponseDTO {
  @ApiProperty({
    description: 'Array of notebook metadata objects',
    example: [
      {
        title: 'Ryu Notes',
        description: 'My notes for Ryu',
        characterCode: 'ryu',
        brand: 'sf6',
        color: '#ff0000',
        coverImageUrl: '',
      },
    ],
    type: 'array',
  })
  books: any[];

  @ApiProperty({
    description: 'Map of notebook IDs to their note contents (JSON string)',
    example: {
      'notebook-123': '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"My notes"}]}]}',
    },
  })
  notes: { [key: string]: string };

  @ApiProperty({
    description: 'When the notes were last synced to cloud',
    example: '2025-01-27T15:30:00.000Z',
  })
  updatedAt: Date;
}

export class SyncNotesResponseDTO {
  @ApiProperty({
    description: 'Whether the sync was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Unique identifier for the notebook',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  noteBookID: string;

  @ApiProperty({
    description: 'When the sync completed',
    example: '2025-01-27T15:30:00.000Z',
  })
  syncedAt: Date;
}

export class DeleteNotesResponseDTO {
  @ApiProperty({
    description: 'Whether the deletion was successful',
    example: true,
  })
  success: boolean;
}
