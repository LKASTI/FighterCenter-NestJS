import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { TournamentRepository } from 'src/domain/tournament/tournament.repository';
import {
  CreateTournamentDTO,
  FindTournamentsQueryDTO,
  UpdateTournamentDTO,
} from 'src/dtos/tournament.dto';
import { Tournament } from 'src/domain/entities/tournament.entity';

export class TournamentService {
  constructor(
    @InjectRepository(TournamentRepository)
    private readonly tournamentRepository: TournamentRepository,
  ) {}

  public async create(
    createTournamentDTO: CreateTournamentDTO,
  ): Promise<Tournament> {
    return await this.tournamentRepository.createAndSave(createTournamentDTO);
  }

  public async findAll(query: FindTournamentsQueryDTO) {
    return await this.tournamentRepository.findAll(query);
  }

  public async findById(id: number): Promise<Tournament> {
    return await this.tournamentRepository.findOneBy({ tournamentID: id });
  }

  public async findAllGamePatchesByEventId(eventID: number) {
    return await this.tournamentRepository.findAllGamePatchesByEventId(eventID);
  }

  public async update(
    id: number,
    updateTournamentDTO: UpdateTournamentDTO,
  ): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findOneBy({
      tournamentID: id,
    });

    if (!tournament) {
      return null;
    }

    await this.tournamentRepository.update(
      { tournamentID: id },
      updateTournamentDTO,
    );
    return await this.tournamentRepository.findOneBy({ tournamentID: id });
  }

  public async remove(id: number): Promise<boolean> {
    const result = await this.tournamentRepository.delete({ tournamentID: id });
    return result.affected > 0;
  }
}
