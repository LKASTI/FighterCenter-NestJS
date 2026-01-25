import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwtAuth.guard';
import { TechLibraryService } from 'src/domain/techLibrary/techLibrary.service';
import { SyncTechLibraryDTO, ShareTechEntryDTO } from 'src/dtos/techLibrary.dto';

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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async shareEntry(@Req() req, @Body() shareEntryDto: ShareTechEntryDTO) {
    const startggUserID = req.user.startggUserID;
    return await this.techLibraryService.shareEntry(startggUserID, shareEntryDto);
  }

  /**
   * GET /api/tech/shared
   * List user's shared entries (Auth Required)
   */
  @Get('shared')
  @UseGuards(JwtAuthGuard)
  async listSharedEntries(@Req() req) {
    const startggUserID = req.user.startggUserID;
    return await this.techLibraryService.listSharedEntries(startggUserID);
  }

  /**
   * GET /api/tech/shared/:shareCode
   * View shared entry (Public - No Auth Required)
   */
  @Get('shared/:shareCode')
  async getSharedEntry(@Param('shareCode') shareCode: string) {
    return await this.techLibraryService.getSharedEntry(shareCode);
  }

  /**
   * DELETE /api/tech/shared/:id
   * Delete shared entry (Auth Required)
   */
  @Delete('shared/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSharedEntry(@Req() req, @Param('id') id: string) {
    const startggUserID = req.user.startggUserID;
    return await this.techLibraryService.deleteSharedEntry(startggUserID, id);
  }

  // ==========================================
  // TECH LIBRARY SYNC ENDPOINTS (Auth Required)
  // ==========================================

  /**
   * GET /api/tech
   * List all characters user has tech data for
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async listCharacters(@Req() req) {
    const startggUserID = req.user.startggUserID;
    const characters = await this.techLibraryService.listCharacters(startggUserID);
    return { characters };
  }

  /**
   * POST /api/tech/:character
   * Upload/sync tech library for specific character
   */
  @Post(':character')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async syncTechLibrary(
    @Req() req,
    @Param('character') character: string,
    @Body() syncTechDto: SyncTechLibraryDTO,
  ) {
    const startggUserID = req.user.startggUserID;
    return await this.techLibraryService.syncTechLibrary(
      startggUserID,
      character,
      syncTechDto,
    );
  }

  /**
   * GET /api/tech/:character
   * Download tech library for specific character
   */
  @Get(':character')
  @UseGuards(JwtAuthGuard)
  async getTechLibrary(@Req() req, @Param('character') character: string) {
    const startggUserID = req.user.startggUserID;
    return await this.techLibraryService.getTechLibrary(startggUserID, character);
  }

  /**
   * DELETE /api/tech/:character
   * Delete tech library for character
   */
  @Delete(':character')
  @UseGuards(JwtAuthGuard)
  async deleteTechLibrary(@Req() req, @Param('character') character: string) {
    const startggUserID = req.user.startggUserID;
    return await this.techLibraryService.deleteTechLibrary(startggUserID, character);
  }
}
