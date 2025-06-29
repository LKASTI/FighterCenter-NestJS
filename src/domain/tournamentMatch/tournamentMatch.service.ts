import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateTournamentMatchDTO,
  FindTournamentMatchesQueryDTO,
  UpdateTournamentMatchDTO,
} from 'src/dtos/tournamentMatch.dto';
import { TournamentMatchRepository } from 'src/domain/tournamentMatch/tournamentMatch.repository';

@Injectable()
export class TournamentMatchService {
  constructor(
    @InjectRepository(TournamentMatchRepository)
    private readonly tournamentMatchRepository: TournamentMatchRepository,
  ) {}

  public async create(createTournamentMatch: CreateTournamentMatchDTO) {
    return await this.tournamentMatchRepository.createAndSave(
      createTournamentMatch,
    );
  }

  public async findAll(query: FindTournamentMatchesQueryDTO) {
    return await this.tournamentMatchRepository.findAll(query);
  }

  public async findById(id: number) {
    return await this.tournamentMatchRepository.findOneBy({
      tournamentMatchID: id,
    });
  }

  public async update(
    id: number,
    updateTournamentMatchDTO: UpdateTournamentMatchDTO,
  ) {
    const tournamentMatch = await this.tournamentMatchRepository.findOneBy({
      tournamentMatchID: id,
    });

    if (!tournamentMatch) return null;

    await this.tournamentMatchRepository.update(
      { tournamentMatchID: id },
      updateTournamentMatchDTO,
    );
    return await this.tournamentMatchRepository.findOneBy({
      tournamentMatchID: id,
    });
  }

  public async remove(id: number) {
    const result = await this.tournamentMatchRepository.delete({
      tournamentMatchID: id,
    });
    return result.affected > 0;
  }
}
