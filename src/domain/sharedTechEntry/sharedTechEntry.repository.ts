import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharedTechEntry } from 'src/domain/entities/sharedTechEntry.entity';

export class SharedTechEntryRepository extends Repository<SharedTechEntry> {
  constructor(
    @InjectRepository(SharedTechEntry)
    private sharedTechEntryRepository: Repository<SharedTechEntry>,
  ) {
    super(
      sharedTechEntryRepository.target,
      sharedTechEntryRepository.manager,
      sharedTechEntryRepository.queryRunner,
    );
  }

  public async findByShareCode(shareCode: string): Promise<SharedTechEntry | null> {
    return this.sharedTechEntryRepository.findOne({
      where: { shareCode, isPublic: true },
      relations: ['user'],
    });
  }

  public async findByUser(userId: string): Promise<SharedTechEntry[]> {
    return this.sharedTechEntryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  public async createAndSave(entryData: Partial<SharedTechEntry>): Promise<SharedTechEntry> {
    try {
      const newEntry = this.sharedTechEntryRepository.create(entryData);
      return await this.sharedTechEntryRepository.save(newEntry);
    } catch (error) {
      console.error('Error in sharedTechEntry createAndSave:', error);
      throw error;
    }
  }

  public async incrementViewCount(shareCode: string): Promise<void> {
    await this.sharedTechEntryRepository
      .createQueryBuilder()
      .update(SharedTechEntry)
      .set({ viewCount: () => 'view_count + 1' })
      .where('share_code = :shareCode', { shareCode })
      .execute();
  }
}
