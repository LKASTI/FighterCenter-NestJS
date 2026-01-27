import { IsNotEmpty, IsObject, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncNotesDTO {
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
  @IsNotEmpty()
  @IsArray()
  readonly books: any[];

  @ApiProperty({
    description: 'Map of notebook IDs to their note contents (JSON string)',
    example: {
      'notebook-123': '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"My notes"}]}]}',
    },
  })
  @IsNotEmpty()
  @IsObject()
  readonly notes: { [key: string]: string };
}
