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

  public async findByUser(startggUserID: string): Promise<TechLibrary[]> {
    return this.techLibraryRepository.find({
      where: { startggUserID },
      order: { lastSyncedAt: 'DESC' },
    });
  }

  public async findByUserAndCharacter(
    startggUserID: string,
    characterCode: string,
    brand: string = 'sf6',
  ): Promise<TechLibrary | null> {
    return this.techLibraryRepository.findOne({
      where: { startggUserID, characterCode, brand },
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
