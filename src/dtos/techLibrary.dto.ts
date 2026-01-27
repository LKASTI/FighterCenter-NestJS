import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsObject,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncTechLibraryDTO {
  @ApiProperty({
    description: 'Name of the character (e.g., "Ryu", "Ken")',
    example: 'Ryu',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly characterName: string;

  @ApiProperty({
    description: 'Array of tech category objects',
    example: [
      { id: 'cat-1', name: 'Corner Combos', color: '#ff0000' },
      { id: 'cat-2', name: 'Anti-Air', color: '#00ff00' },
    ],
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  readonly techCategories?: any[];

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
  @IsOptional()
  @IsArray()
  readonly savedTechEntries?: any[];

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
  @IsOptional()
  @IsArray()
  readonly savedMeatySetups?: any[];

  @ApiProperty({
    description: 'ISO date string of when the data was exported',
    example: '2025-01-27T10:30:00.000Z',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  readonly exportDate?: string;

  @ApiProperty({
    description: 'Version of the tech library format',
    example: '1.0.0',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  readonly version?: string;

  @ApiProperty({
    description: 'Total number of items in the library',
    example: 42,
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  readonly totalItems?: number;
}

export class ShareTechEntryDTO {
  @ApiProperty({
    description: 'Character code (e.g., "ryu", "ken", "chun-li")',
    example: 'ryu',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly character_code: string;

  @ApiProperty({
    description: 'Type of entry (e.g., "combo", "setup", "meaty")',
    example: 'combo',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly entry_type: string;

  @ApiProperty({
    description: 'The actual entry data object',
    example: {
      id: 'entry-1',
      title: 'Midscreen BnB',
      sequence: '2MK > 236MK > 623HP',
      damage: 2800,
      notes: 'Works on most characters',
    },
  })
  @IsNotEmpty()
  @IsObject()
  readonly entry_data: any;
}
