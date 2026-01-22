import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, BeforeUpdate } from 'typeorm';
import { StartggUser } from './startggUser.entity';

@Entity('tech_library')
export class TechLibrary {
  /* Attributes */
  @PrimaryGeneratedColumn('uuid', { name: 'tech_library_id' })
  techLibraryID: string;

  @Column('uuid', { name: 'startgg_user_id' })
  startggUserID: string;

  @Column('text', { name: 'character_code', nullable: false })
  characterCode: string;

  @Column('varchar', { name: 'brand', length: 10, default: 'sf6' })
  brand: string;

  @Column('text', { name: 'description', nullable: true })
  description: string;

  // JSONB field for storing full library content
  // Matches export format from DrillBookInterface.tsx:1547-1558
  // Structure: {
  //   characterName: string,
  //   exportDate: string,
  //   version: string,
  //   techCategories: any[],
  //   savedTechEntries: any[],
  //   savedMeatySetups: any[],
  //   totalItems: number
  // }
  @Column('jsonb', { name: 'content', default: {} })
  content: {
    characterName?: string;
    exportDate?: string;
    version?: string;
    techCategories?: any[];
    savedTechEntries?: any[];
    savedMeatySetups?: any[];
    totalItems?: number;
  };

  @Column('integer', { name: 'entry_count', default: 0 })
  entryCount: number;

  @Column('integer', { name: 'category_count', default: 0 })
  categoryCount: number;

  @Column('boolean', { name: 'is_public', default: false })
  isPublic: boolean;

  @Column('integer', { name: 'view_count', default: 0 })
  viewCount: number;

  @Column('text', { name: 'tags', array: true, default: '{}' })
  tags: string[];

  @Column('timestamptz', { name: 'last_synced_at', default: () => 'NOW()' })
  lastSyncedAt: Date;

  @Column('timestamptz', { name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;

  @Column('timestamptz', { name: 'updated_at', default: () => 'NOW()' })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
    this.lastSyncedAt = new Date();
  }

  /* Relationships */
  @ManyToOne(() => StartggUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'startgg_user_id' })
  user: StartggUser;
}
