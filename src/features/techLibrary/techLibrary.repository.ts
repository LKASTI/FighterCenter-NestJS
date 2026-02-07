import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TechLibrary } from 'src/domain/entities/techLibrary.entity';

export class TechLibraryRepository extends Repository<TechLibrary> {
  constructor(
    @InjectRepository(TechLibrary)
    private techLibraryRepository: Repository<TechLibrary>,
  ) {
    super(
      techLibraryRepository.target,
      techLibraryRepository.manager,
      techLibraryRepository.queryRunner,
    );
  }

  public async findByUser(userId: string): Promise<TechLibrary[]> {
    return this.techLibraryRepository.find({
      where: { userId },
      order: { lastSyncedAt: 'DESC' },
    });
  }

  public async findByUserAndCharacter(
    userId: string,
    characterCode: string,
    brand: string = 'sf6',
  ): Promise<TechLibrary | null> {
    return this.techLibraryRepository.findOne({
      where: { userId, characterCode, brand },
    });
  }

  public async createAndSave(techLibraryData: Partial<TechLibrary>): Promise<TechLibrary> {
    try {
      const newTechLibrary = this.techLibraryRepository.create(techLibraryData);
      return await this.techLibraryRepository.save(newTechLibrary);
    } catch (error) {
      console.error('Error in techLibrary createAndSave:', error);
      throw error;
    }
  }
}
