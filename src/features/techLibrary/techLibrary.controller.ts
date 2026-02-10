import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TechLibraryService } from './techLibrary.service';
import { SyncTechLibraryDTO, ShareTechEntryDTO } from '@dtos/techLibrary.dto';
import {
  SyncTechLibraryResponseDTO,
  ShareTechEntryResponseDTO,
  ListCharactersResponseDTO,
  GetTechLibraryResponseDTO,
  GetSharedEntryResponseDTO,
  SharedTechEntryListItemDTO,
  DeleteTechLibraryResponseDTO,
  DeleteSharedEntryResponseDTO,
} from '@dtos/techLibrary.response.dto';
import {
  ApiTechLibraryPost,
  ApiTechLibraryGet,
  ApiTechLibraryDelete,
  ApiSharedTechPost,
  ApiSharedTechGet,
  ApiSharedTechPublicGet,
  ApiSharedTechDelete,
} from './decorators/tech-library-swagger.decorators';
import { validateUserSession } from "@fgclegends/fightercenter-shared-nestjs";

@Controller('tech')
export class TechLibraryController {
  constructor(private readonly techLibraryService: TechLibraryService) {}

  // ==========================================
  // SHARING ENDPOINTS (Must be defined before dynamic :character routes)
  // ==========================================

  /**
   * POST /api/tech/share
   * Share an individual tech entry (Auth Required)
   */
  @Post('share')
  @ApiSharedTechPost('Share an individual tech entry', ShareTechEntryResponseDTO)
  @HttpCode(HttpStatus.CREATED)
  async shareEntry(@Req() req, @Body() shareEntryDto: ShareTechEntryDTO) {
    const userId = validateUserSession(req);
    return await this.techLibraryService.shareEntry(userId, shareEntryDto);
  }

  /**
   * GET /api/tech/shared
   * List user's shared entries (Auth Required)
   */
  @Get('shared')
  @ApiSharedTechGet("List user's shared tech entries", [SharedTechEntryListItemDTO])
  async listSharedEntries(@Req() req) {
    const userId = validateUserSession(req);
    return await this.techLibraryService.listSharedEntries(userId);
  }

  /**
   * GET /api/tech/shared/:shareCode
   * View shared entry (Public - No Auth Required)
   */
  @Get('shared/:shareCode')
  @ApiSharedTechPublicGet('View a shared tech entry (public)', GetSharedEntryResponseDTO)
  async getSharedEntry(@Param('shareCode') shareCode: string) {
    return await this.techLibraryService.getSharedEntry(shareCode);
  }

  /**
   * DELETE /api/tech/shared/:id
   * Delete shared entry (Auth Required)
   */
  @Delete('shared/:id')
  @ApiSharedTechDelete('Delete a shared tech entry', DeleteSharedEntryResponseDTO)
  async deleteSharedEntry(@Req() req, @Param('id') id: string) {
    const userId = validateUserSession(req);
    return await this.techLibraryService.deleteSharedEntry(userId, id);
  }

  // ==========================================
  // TECH LIBRARY SYNC ENDPOINTS (Auth Required)
  // ==========================================

  /**
   * GET /api/tech
   * List all characters user has tech data for
   */
  @Get()
  @ApiTechLibraryGet('List all characters with tech data', ListCharactersResponseDTO)
  async listCharacters(@Req() req) {
    const userId = validateUserSession(req);
    const characters = await this.techLibraryService.listCharacters(userId);
    return { characters };
  }

  /**
   * POST /api/tech/:character
   * Upload/sync tech library for specific character
   */
  @Post(':character')
  @ApiTechLibraryPost('Sync tech library for a character', SyncTechLibraryResponseDTO)
  @HttpCode(HttpStatus.CREATED)
  async syncTechLibrary(
    @Req() req,
    @Param('character') character: string,
    @Body() syncTechDto: SyncTechLibraryDTO,
  ) {
    const userId = validateUserSession(req);
    return await this.techLibraryService.syncTechLibrary(
      userId,
      character,
      syncTechDto,
    );
  }

  /**
   * GET /api/tech/:character
   * Download tech library for specific character
   */
  @Get(':character')
  @ApiTechLibraryGet('Get tech library for a character', GetTechLibraryResponseDTO)
  async getTechLibrary(@Req() req, @Param('character') character: string) {
    const userId = validateUserSession(req);
    return await this.techLibraryService.getTechLibrary(userId, character);
  }

  /**
   * DELETE /api/tech/:character
   * Delete tech library for character
   */
  @Delete(':character')
  @ApiTechLibraryDelete('Delete tech library for a character', DeleteTechLibraryResponseDTO)
  async deleteTechLibrary(@Req() req, @Param('character') character: string) {
    const userId = validateUserSession(req);
    return await this.techLibraryService.deleteTechLibrary(userId, character);
  }
}
