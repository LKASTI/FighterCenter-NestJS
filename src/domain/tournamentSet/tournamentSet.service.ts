import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateTournamentSetDTO,
  FindTournamentSetsQueryDTO,
  UpdateTournamentSetDTO,
} from 'src/dtos/tournamentSet.dto';
import { TournamentSetRepository } from 'src/domain/tournamentSet/tournamentSet.repository';

@Injectable()
export class TournamentSetService {
  constructor(
    @InjectRepository(TournamentSetRepository)
    private readonly tournamentSetRepository: TournamentSetRepository,
  ) {}

  public async create(createTournamentSetDTO: CreateTournamentSetDTO) {
    return await this.tournamentSetRepository.createAndSave(
      createTournamentSetDTO,
    );
  }

  public async findAll(query: FindTournamentSetsQueryDTO) {
    return await this.tournamentSetRepository.findAll(query);
  }

  public async findById(id: number) {
    return await this.tournamentSetRepository.findOneBy({
      tournamentSetID: id,
    });
  }

  public async findByStartGGSetId(id: number) {
    return await this.tournamentSetRepository.findOneBy({ startggSetID: id });
  }

  public async findAllByTournamentID(tournamentID: number) {
    return await this.tournamentSetRepository.findAllByTournamentID(
      tournamentID,
    );
  }

  public async update(
    id: number,
    updateTournamentSetDTO: UpdateTournamentSetDTO,
  ) {
    const tournamentSet = await this.tournamentSetRepository.findOneBy({
      tournamentSetID: id,
    });

    if (!tournamentSet) {
      return null;
    }

    await this.tournamentSetRepository.update(
      { tournamentSetID: id },
      updateTournamentSetDTO,
    );
    return await this.tournamentSetRepository.findOneBy({
      tournamentSetID: id,
    });
  }

  public async remove(id: number) {
    const result = await this.tournamentSetRepository.delete({
      tournamentSetID: id,
    });
    return result.affected > 0;
  }
}
