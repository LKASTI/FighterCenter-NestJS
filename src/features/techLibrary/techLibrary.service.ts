import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TechLibrary } from 'src/domain/entities/techLibrary.entity';
import { TechLibraryRepository } from './techLibrary.repository';
import { SharedTechEntry } from 'src/domain/entities/sharedTechEntry.entity';
import { SharedTechEntryRepository } from 'src/domain/sharedTechEntry/sharedTechEntry.repository';
import { AuthClientService, AuthUser } from "@fgclegends/fightercenter-shared-nestjs";

@Injectable()
export class TechLibraryService {
  constructor(
    @InjectRepository(TechLibraryRepository)
    private readonly techLibraryRepository: TechLibraryRepository,
    @InjectRepository(SharedTechEntryRepository)
    private readonly sharedTechEntryRepository: SharedTechEntryRepository,
    private readonly authClientService: AuthClientService,
  ) {}

  /**
   * Sync tech library for a specific character
   */
  public async syncTechLibrary(
    userId: string,
    characterCode: string,
    data: {
      characterName: string;
      techCategories?: any[];
      savedTechEntries?: any[];
      savedMeatySetups?: any[];
    },
  ): Promise<{
    success: boolean;
    techLibraryID: string;
    characterCode: string;
    entryCount: number;
    syncedAt: Date;
  }> {
    // Calculate counts
    const entryCount = (data.savedTechEntries?.length || 0) + (data.savedMeatySetups?.length || 0);
    const categoryCount = data.techCategories?.length || 0;

    // Add metadata to match export format
    const contentWithMetadata = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalItems: entryCount + categoryCount,
    };

    let techLibrary = await this.techLibraryRepository.findByUserAndCharacter(
      userId,
      characterCode,
      'sf6',
    );

    if (techLibrary) {
      // Update existing
      techLibrary.content = contentWithMetadata;
      techLibrary.entryCount = entryCount;
      techLibrary.categoryCount = categoryCount;
      techLibrary.lastSyncedAt = new Date();
      techLibrary.updatedAt = new Date();
      await this.techLibraryRepository.save(techLibrary);
    } else {
      // Create new
      techLibrary = await this.techLibraryRepository.createAndSave({
        userId,
        characterCode,
        brand: 'sf6',
        content: contentWithMetadata,
        entryCount,
        categoryCount,
      });
    }

    return {
      success: true,
      techLibraryID: techLibrary.techLibraryID,
      characterCode,
      entryCount,
      syncedAt: techLibrary.lastSyncedAt,
    };
  }

  /**
   * Get tech library for a specific character
   * Returns null if no library exists
   */
  public async getTechLibrary(
    userId: string,
    characterCode: string,
  ): Promise<any | null> {
    const techLibrary = await this.techLibraryRepository.findByUserAndCharacter(
      userId,
      characterCode,
      'sf6',
    );

    if (!techLibrary) {
      return null;
    }

    return techLibrary.content;
  }

  /**
   * List all characters that user has tech data for (metadata only)
   */
  public async listCharacters(userId: string): Promise<any[]> {
    const libraries = await this.techLibraryRepository.findByUser(userId);

    return libraries.map((lib) => ({
      id: lib.techLibraryID,
      characterCode: lib.characterCode,
      entryCount: lib.entryCount,
      categoryCount: lib.categoryCount,
      lastSyncedAt: lib.lastSyncedAt,
      isPublic: lib.isPublic,
    }));
  }

  /**
   * Delete tech library for a specific character
   */
  public async deleteTechLibrary(
    userId: string,
    characterCode: string,
  ): Promise<{ success: boolean }> {
    await this.techLibraryRepository.delete({
      userId,
      characterCode,
    });
    return { success: true };
  }

  /**
   * Share an individual tech entry
   * Generates a unique share code and creates a shared entry
   */
  public async shareEntry(
    userId: string,
    data: {
      character_code: string;
      entry_type: string;
      entry_data: any;
    },
  ): Promise<{ id: string; shareCode: string; shareUrl: string }> {
    // Generate unique share code
    const shareCode = this.generateShareCode();

    // Extract title from entry_data if available
    const title = data.entry_data.title || `${data.entry_type} for ${data.character_code}`;

    const sharedEntry = await this.sharedTechEntryRepository.createAndSave({
      userId,
      characterCode: data.character_code,
      entryType: data.entry_type,
      title,
      entryData: data.entry_data,
      shareCode,
    });

    // Get frontend URL from environment
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return {
      id: sharedEntry.sharedTechEntryID,
      shareCode,
      shareUrl: `${frontendUrl}/shared/${shareCode}`,
    };
  }

  /**
   * Get shared entry by share code (public access)
   */
  public async getSharedEntry(shareCode: string): Promise<any> {
    const entry = await this.sharedTechEntryRepository.findByShareCode(shareCode);

    if (!entry) {
      throw new NotFoundException('Shared entry not found');
    }

    // Fetch user data from auth service
    const user: AuthUser | null = await this.authClientService.getUserById(entry.userId);

    // Increment view count
    await this.sharedTechEntryRepository.incrementViewCount(shareCode);

    return {
      id: entry.sharedTechEntryID,
      characterCode: entry.characterCode,
      entryType: entry.entryType,
      title: entry.title,
      entryData: entry.entryData,
      viewCount: entry.viewCount + 1, // Return incremented count
      createdAt: entry.createdAt,
      author: {
        userId: entry.userId,
        username: user?.startggUsername,
        gamertag: user?.startggGamerTag,
      },
    };
  }

  /**
   * List user's shared entries
   */
  public async listSharedEntries(userId: string): Promise<any[]> {
    const entries = await this.sharedTechEntryRepository.findByUser(userId);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return entries.map((entry) => ({
      id: entry.sharedTechEntryID,
      characterCode: entry.characterCode,
      entryType: entry.entryType,
      title: entry.title,
      shareCode: entry.shareCode,
      shareUrl: `${frontendUrl}/shared/${entry.shareCode}`,
      viewCount: entry.viewCount,
      isPublic: entry.isPublic,
      createdAt: entry.createdAt,
    }));
  }

  /**
   * Delete a shared entry
   */
  public async deleteSharedEntry(
    userId: string,
    sharedEntryID: string,
  ): Promise<{ success: boolean }> {
    const result = await this.sharedTechEntryRepository.delete({
      sharedTechEntryID: sharedEntryID,
      userId, // Ensure user owns the entry
    });

    if (result.affected === 0) {
      throw new NotFoundException('Shared entry not found or access denied');
    }

    return { success: true };
  }

  /**
   * Generate a unique 12-character share code
   */
  private generateShareCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
