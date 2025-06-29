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
  BadRequestException,
} from '@nestjs/common';
import {
  CreateSFSixRankedCharacterRankingDTO,
  FindSFSixRankedCharacterRankingsQueryDTO,
  UpdateSFSixRankedCharacterRankingDTO,
} from 'src/dtos/sfsixRankedCharacterRanking.dto';
import { SFSixRankedCharacterRanking } from 'src/domain/entities/sfsixRankedCharacterRanking.entity';
import { SFSixRankedCharacterRankingService } from 'src/domain/sfsixRankedCharacterRanking/sfsixRankedCharacterRanking.service';

@Controller('sfsixRankedCharacterRanking')
export class SFSixRankedCharacterRankingController {
  constructor(private readonly service: SFSixRankedCharacterRankingService) {}

  @Post()
  async create(
    @Body()
    sfsixRankedCharacterRankingDTO: CreateSFSixRankedCharacterRankingDTO,
  ): Promise<SFSixRankedCharacterRanking> {
    return await this.service.create(sfsixRankedCharacterRankingDTO);
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: FindSFSixRankedCharacterRankingsQueryDTO,
  ) {
    return await this.service.findAll(query);
  }

  @Get('findAllRankedPlayerAndCharacterInfoByDateAndPhase')
  async findAllRankedPlayerAndCharacterInfoByDateAndPhase(
    @Query(new ValidationPipe({ transform: true }))
    query: FindSFSixRankedCharacterRankingsQueryDTO,
  ) {
    if (!query.phase)
      throw new BadRequestException(`Request must contain a phase and date`);
    if (!query.date)
      throw new BadRequestException(`Request must contain a phase and date`);
    return await this.service.findAllRankedPlayerAndCharacterInfoByDateAndPhase(
      query,
    );
  }

  @Get('findAllPhases')
  async findAllPhases() {
    return await this.service.findAllPhases();
  }

  @Get('findAllWeeklyDatesByPhase/:phase')
  async findAllWeeklyDatesByPhase(@Param('phase', ParseIntPipe) phase: number) {
    return await this.service.findAllWeeklyDatesByPhase(phase);
  }

  @Get('findAllDistinctDatePhaseSeason')
  async findAllDistinctDatePhaseSeason() {
    const res = await this.service.findAllDistinctDatePhaseSeason();

    if (!res)
      throw new NotFoundException(
        'No SFSixRankedCharacterRanking records were found with dates, phases, or seasons',
      );

    return res;
  }

  @Get(':id')
  async findByID(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SFSixRankedCharacterRanking> {
    const rankedCharacter = await this.service.findById(id);
    if (!rankedCharacter) {
      throw new NotFoundException(
        `SFSixRankedCharacterRanking with ID ${id} not found`,
      );
    }
    return rankedCharacter;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateSFSixRankedCharacterRankingDto: UpdateSFSixRankedCharacterRankingDTO,
  ): Promise<SFSixRankedCharacterRanking> {
    const rankedCharacter = await this.service.update(
      id,
      updateSFSixRankedCharacterRankingDto,
    );
    if (!rankedCharacter) {
      throw new NotFoundException(
        `SFSixRankedCharacterRanking with ID ${id} not found`,
      );
    }
    return rankedCharacter;
  }

  @Delete(':id')
  @HttpCode(204) // No Content
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const result = await this.service.remove(id);
    if (!result)
      throw new NotFoundException(
        `SFSixRankedCharacterRanking with ID ${id} not found`,
      );
  }
}
