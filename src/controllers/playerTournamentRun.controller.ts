import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Query,
  Param,
  ParseIntPipe,
  NotFoundException,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { PlayerTournamentRunService } from 'src/domain/playerTournamentRun/playerTournamentRun.service';
import { PlayerTournamentRun } from 'src/domain/entities/playerTournamentRun.entity';
import {
  CreatePlayerTournamentRunDTO,
  FindPlayerTournamentRunsQueryDTO,
  UpdatePlayerTournamentRunDTO,
} from 'src/dtos/playerTournamentRun.dto';

@Controller('playerTournamentRun')
export class PlayerTournamentRunController {
  constructor(private readonly service: PlayerTournamentRunService) {}

  @Post()
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createPlayerTournamentRunDTO: CreatePlayerTournamentRunDTO,
  ): Promise<PlayerTournamentRun> {
    return await this.service.create(createPlayerTournamentRunDTO);
  }

  @Get('findAllByTournamentID')
  async findAllByTournamentID(
    @Query('tournamentID', ParseIntPipe) tournamentID: number,
  ) {
    return await this.service.findAllByTournamentID(tournamentID);
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: FindPlayerTournamentRunsQueryDTO,
  ) {
    return await this.service.findAll(query);
  }

  @Get('findAllForSeriesTable/:eventID')
  async findAllForSeriesTable(@Param('eventID', ParseIntPipe) eventID: number) {
    const tmp = await this.service.findAllForSeriesTable(eventID);
    // console.log(tmp)
    return tmp;
  }

  @Patch()
  async update(
    @Body(new ValidationPipe({ transform: true }))
    updatePlayerTournamentRunDTO: UpdatePlayerTournamentRunDTO,
    @Param('playerID', ParseIntPipe) playerID: number,
    @Param('tournamentID', ParseIntPipe) tournamentID: number,
  ): Promise<PlayerTournamentRun> {
    const playerTournamentRun = await this.service.update(
      playerID,
      tournamentID,
      updatePlayerTournamentRunDTO,
    );
    if (!playerTournamentRun) {
      throw new NotFoundException(
        `PlayerTournamentRun with playerID ${playerID} and tournamentID ${tournamentID} not found`,
      );
    }
    return playerTournamentRun;
  }

  @Delete(':playerID/:tournamentID')
  @HttpCode(204) // No Content
  async remove(
    @Param('playerID', ParseIntPipe) playerID: number,
    @Param('tournamentID', ParseIntPipe) tournamentID: number,
  ): Promise<void> {
    const result = await this.service.remove(playerID, tournamentID);
    if (!result) {
      throw new NotFoundException(
        `PlayerTournamentRun with playerID ${playerID} and tournamentID ${tournamentID} not found`,
      );
    }
  }
}
