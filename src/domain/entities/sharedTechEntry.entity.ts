import { Column, Entity, PrimaryGeneratedColumn, BeforeUpdate } from 'typeorm';

@Entity('shared_tech_entry')
export class SharedTechEntry {
  /* Attributes */
  @PrimaryGeneratedColumn('uuid', { name: 'shared_tech_entry_id' })
  sharedTechEntryID: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;  // Foreign key to user table (managed by auth service)

  @Column('text', { name: 'character_code', nullable: false })
  characterCode: string;

  @Column('varchar', { name: 'entry_type', length: 20, nullable: false })
  entryType: string;

  @Column('text', { name: 'title', nullable: true })
  title: string;

  // JSONB field for storing complete entry data
  // Structure: SavedTechEntry object from techTypes.ts
  @Column('jsonb', { name: 'entry_data', nullable: false })
  entryData: any;

  @Column('varchar', { name: 'share_code', length: 12, unique: true, nullable: false })
  shareCode: string;

  @Column('boolean', { name: 'is_public', default: true })
  isPublic: boolean;

  @Column('integer', { name: 'view_count', default: 0 })
  viewCount: number;

  @Column('timestamptz', { name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;

  @Column('timestamptz', { name: 'updated_at', default: () => 'NOW()' })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
