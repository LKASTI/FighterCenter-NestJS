import { IsNotEmpty, IsObject, IsArray, IsOptional } from 'class-validator';

export class SyncNotesDTO {
  @IsNotEmpty()
  @IsArray()
  readonly books: any[];

  @IsNotEmpty()
  @IsObject()
  readonly notes: { [key: string]: string };
}
