import { ApiProperty } from '@nestjs/swagger';

export class TechLibraryMetadataDTO {
  @ApiProperty({
    description: 'Unique identifier for the tech library',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Character code',
    example: 'ryu',
  })
  characterCode: string;

  @ApiProperty({
    description: 'Number of tech entries',
    example: 25,
  })
  entryCount: number;

  @ApiProperty({
    description: 'Number of categories',
    example: 5,
  })
  categoryCount: number;

  @ApiProperty({
    description: 'When the library was last synced',
    example: '2025-01-27T15:30:00.000Z',
  })
  lastSyncedAt: Date;

  @ApiProperty({
    description: 'Whether the library is publicly visible',
    example: false,
  })
  isPublic: boolean;
}

export class ListCharactersResponseDTO {
  @ApiProperty({
    description: 'Array of character tech library metadata',
    type: [TechLibraryMetadataDTO],
  })
  characters: TechLibraryMetadataDTO[];
}

export class GetTechLibraryResponseDTO {
  @ApiProperty({
    description: 'Name of the character',
    example: 'Ryu',
  })
  characterName: string;

  @ApiProperty({
    description: 'Array of tech category objects',
    example: [
      { id: 'cat-1', name: 'Corner Combos', color: '#ff0000' },
      { id: 'cat-2', name: 'Anti-Air', color: '#00ff00' },
    ],
    type: 'array',
  })
  techCategories?: any[];

  @ApiProperty({
    description: 'Array of saved tech entry objects (combos, setups, etc.)',
    example: [
      {
        id: 'entry-1',
        title: 'Midscreen BnB',
        sequence: '2MK > 236MK > 623HP',
        damage: 2800,
        categoryId: 'cat-1',
      },
    ],
    type: 'array',
  })
  savedTechEntries?: any[];

  @ApiProperty({
    description: 'Array of saved meaty setup objects',
    example: [
      {
        id: 'meaty-1',
        title: 'Forward Throw Meaty',
        setup: 'Forward throw > dash > 5MP',
        timing: '18f',
      },
    ],
    type: 'array',
  })
  savedMeatySetups?: any[];

  @ApiProperty({
    description: 'ISO date string of when the data was exported',
    example: '2025-01-27T10:30:00.000Z',
  })
  exportDate?: string;

  @ApiProperty({
    description: 'Version of the tech library format',
    example: '1.0.0',
  })
  version?: string;

  @ApiProperty({
    description: 'Total number of items in the library',
    example: 42,
  })
  totalItems?: number;
}

export class SharedTechEntryAuthorDTO {
  @ApiProperty({
    description: 'Start.gg user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  startggUserId: string;

  @ApiProperty({
    description: 'Start.gg username',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Start.gg gamertag',
    example: 'JohnDoe',
  })
  gamertag: string;
}

export class GetSharedEntryResponseDTO {
  @ApiProperty({
    description: 'Unique identifier for the shared entry',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Character code',
    example: 'ryu',
  })
  characterCode: string;

  @ApiProperty({
    description: 'Type of entry (combo, setup, meaty)',
    example: 'combo',
  })
  entryType: string;

  @ApiProperty({
    description: 'Title of the entry',
    example: 'Midscreen BnB',
  })
  title: string;

  @ApiProperty({
    description: 'The actual entry data',
    example: {
      id: 'entry-1',
      title: 'Midscreen BnB',
      sequence: '2MK > 236MK > 623HP',
      damage: 2800,
      notes: 'Works on most characters',
    },
  })
  entryData: any;

  @ApiProperty({
    description: 'Number of times the entry has been viewed',
    example: 42,
  })
  viewCount: number;

  @ApiProperty({
    description: 'When the entry was created',
    example: '2025-01-27T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Information about the user who shared this entry',
    type: SharedTechEntryAuthorDTO,
  })
  author: SharedTechEntryAuthorDTO;
}

export class SharedTechEntryListItemDTO {
  @ApiProperty({
    description: 'Unique identifier for the shared entry',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Character code',
    example: 'ryu',
  })
  characterCode: string;

  @ApiProperty({
    description: 'Type of entry (combo, setup, meaty)',
    example: 'combo',
  })
  entryType: string;

  @ApiProperty({
    description: 'Title of the entry',
    example: 'Midscreen BnB',
  })
  title: string;

  @ApiProperty({
    description: 'Unique share code',
    example: 'abc123xyz789',
  })
  shareCode: string;

  @ApiProperty({
    description: 'Full shareable URL',
    example: 'https://fightercenter.com/shared/abc123xyz789',
  })
  shareUrl: string;

  @ApiProperty({
    description: 'Number of times the entry has been viewed',
    example: 42,
  })
  viewCount: number;

  @ApiProperty({
    description: 'Whether the entry is publicly visible',
    example: true,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'When the entry was created',
    example: '2025-01-27T10:00:00.000Z',
  })
  createdAt: Date;
}

// This is an array response, so we just use the array type directly
// The decorator will handle wrapping it properly
export type ListSharedEntriesResponseDTO = SharedTechEntryListItemDTO[];

export class SyncTechLibraryResponseDTO {
  @ApiProperty({
    description: 'Whether the sync was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Unique identifier for the tech library',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  techLibraryID: string;

  @ApiProperty({
    description: 'Character code',
    example: 'ryu',
  })
  characterCode: string;

  @ApiProperty({
    description: 'Number of entries synced',
    example: 25,
  })
  entryCount: number;

  @ApiProperty({
    description: 'When the sync completed',
    example: '2025-01-27T15:30:00.000Z',
  })
  syncedAt: Date;
}

export class ShareTechEntryResponseDTO {
  @ApiProperty({
    description: 'Unique identifier for the shared entry',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique share code',
    example: 'abc123xyz789',
  })
  shareCode: string;

  @ApiProperty({
    description: 'Full shareable URL',
    example: 'https://fightercenter.com/shared/abc123xyz789',
  })
  shareUrl: string;
}

export class DeleteTechLibraryResponseDTO {
  @ApiProperty({
    description: 'Whether the deletion was successful',
    example: true,
  })
  success: boolean;
}

export class DeleteSharedEntryResponseDTO {
  @ApiProperty({
    description: 'Whether the deletion was successful',
    example: true,
  })
  success: boolean;
}
