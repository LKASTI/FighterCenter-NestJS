import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateTournamentMatchDTO,
  FindTournamentMatchesQueryDTO,
} from 'src/dtos/tournamentMatch.dto';
import { TournamentMatch } from 'src/domain/entities/tournamentMatch.entity';
import { TournamentSet } from 'src/domain/entities/tournamentSet.entity';
import { Repository } from 'typeorm';

export class TournamentMatchRepository extends Repository<TournamentMatch> {
  constructor(
    @InjectRepository(TournamentMatch)
    private readonly repository: Repository<TournamentMatch>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public async createAndSave(
    tournamentMatch: CreateTournamentMatchDTO,
  ): Promise<TournamentMatch> {
    const tournamentSet = await this.manager
      .getRepository(TournamentSet)
      .findOneBy({ tournamentSetID: tournamentMatch.tournamentSetID });

    if (!tournamentSet)
      throw new NotFoundException(
        `TournamentSet with tournamentSetID ${tournamentMatch.tournamentSetID}`,
      );

    const newTournamentMatch = this.create({
      tournamentSetID: tournamentMatch.tournamentSetID,
      playerOneCharacter: tournamentMatch.playerOneCharacter,
      playerTwoCharacter: tournamentMatch.playerTwoCharacter,
      winnerName: tournamentMatch.winnerName,
      matchNumber: tournamentMatch.matchNumber,
    });

    return await this.save(newTournamentMatch);
  }

  public async findAll(query: FindTournamentMatchesQueryDTO) {
    const queryBuilder = this.createQueryBuilder('tournamentMatch');

    // Apply filters if provided
    if (query.tournamentSetID) {
      queryBuilder.andWhere(
        `tournamentMatch.tournamentSetID = :tournamentSetID`,
        {
          tournamentSetID: query.tournamentSetID,
        },
      );
    }

    if (query.playerOneCharacter) {
      queryBuilder.andWhere(
        `tournamentMatch.playerOneCharacter = :playerOneCharacter`,
        {
          playerOneCharacter: query.playerOneCharacter,
        },
      );
    }

    if (query.playerOneCharacter) {
      queryBuilder.andWhere(
        `tournamentMatch.playerOneCharacter = :playerOneCharacter`,
        {
          playerOneCharacter: query.playerOneCharacter,
        },
      );
    }

    if (query.winnerName) {
      queryBuilder.andWhere(`tournamentMatch.winnerName = :winnerName`, {
        winnerName: query.winnerName,
      });
    }

    if (query.matchNumber) {
      queryBuilder.andWhere(`tournamentMatch.matchNumber = :matchNumber`, {
        matchNumber: query.matchNumber,
      });
    }

    // Add sorting
    if (query.sortBy)
      queryBuilder.orderBy(`tournamentMatch.${query.sortBy}`, query.order);

    // Add limit
    queryBuilder.take(query.limit);

    const [tournamentMatches, count] = await queryBuilder.getManyAndCount();

    return {
      data: tournamentMatches,
      meta: {
        limit: query.limit,
        total: count,
      },
    };
  }
}
