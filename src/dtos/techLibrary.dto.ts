import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsObject,
  IsNumber,
} from 'class-validator';

export class SyncTechLibraryDTO {
  @IsNotEmpty()
  @IsString()
  readonly characterName: string;

  @IsOptional()
  @IsArray()
  readonly techCategories?: any[];

  @IsOptional()
  @IsArray()
  readonly savedTechEntries?: any[];

  @IsOptional()
  @IsArray()
  readonly savedMeatySetups?: any[];

  @IsOptional()
  @IsString()
  readonly exportDate?: string;

  @IsOptional()
  @IsString()
  readonly version?: string;

  @IsOptional()
  @IsNumber()
  readonly totalItems?: number;
}

export class ShareTechEntryDTO {
  @IsNotEmpty()
  @IsString()
  readonly character_code: string;

  @IsNotEmpty()
  @IsString()
  readonly entry_type: string;

  @IsNotEmpty()
  @IsObject()
  readonly entry_data: any;
}
