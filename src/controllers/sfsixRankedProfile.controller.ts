import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  ValidationPipe,
  NotFoundException,
  Param,
  ParseIntPipe,
  Delete,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { UpdatePlayerDTO } from 'src/dtos/player.dto';
import {
  CreateSFSixRankedProfileDTO,
  FindSFSixRankedProfilesQueryDTO,
  UpdateSFSixRankedProfileDTO,
} from 'src/dtos/sfsixRankedProfile.dto';
import { Player } from 'src/domain/entities/player.entity';
import { SFSixRankedProfile } from 'src/domain/entities/sfsixRankedProfile.entity';
import { SFSixRankedProfileService } from 'src/domain/sfsixRankedProfile/sfsixRankedProfile.service';

@Controller('sfsixRankedProfile')
export class SFSixRankedProfileController {
  constructor(private readonly service: SFSixRankedProfileService) {}

  @Post()
  async create(
    @Body() rankedProfileDTO: CreateSFSixRankedProfileDTO,
  ): Promise<SFSixRankedProfile> {
    return await this.service.create(rankedProfileDTO);
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: FindSFSixRankedProfilesQueryDTO,
  ) {
    return await this.service.findAll(query);
  }

  @Get(':id')
  async findByID(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SFSixRankedProfile> {
    const profile = await this.service.findById(id);
    if (!profile) {
      throw new NotFoundException(
        `SFSixRankedProfile with usercode ${id} not found`,
      );
    }
    return profile;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSFSixRankedProfileDto: UpdateSFSixRankedProfileDTO,
  ): Promise<SFSixRankedProfile> {
    const profile = await this.service.update(id, updateSFSixRankedProfileDto);
    if (!profile) {
      throw new NotFoundException(
        `SFSixRankedProfile with usercode ${id} not found`,
      );
    }
    return profile;
  }

  @Delete(':id')
  @HttpCode(204) // No Content
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const result = await this.service.remove(id);
    if (!result) {
      throw new NotFoundException(
        `SFSixRankedProfile with usercode ${id} not found`,
      );
    }
  }
}
