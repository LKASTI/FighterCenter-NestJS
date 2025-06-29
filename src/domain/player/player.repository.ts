import { InjectRepository } from '@nestjs/typeorm';
import { Player } from 'src/domain/entities/player.entity';
import { Repository } from 'typeorm';
import { CreatePlayerDTO, FindPlayersQueryDTO } from 'src/dtos/player.dto';

export class PlayerRepository extends Repository<Player> {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {
    super(
      playerRepository.target,
      playerRepository.manager,
      playerRepository.queryRunner,
    );
  }

  public async createAndSave(player: CreatePlayerDTO): Promise<Player> {
    // console.log('Repository creating player: ', player)
    try {
      const newPlayer = this.playerRepository.create(player);
      // console.log('New Player: ', newPlayer)
      const savedPlayer = await this.playerRepository.save(newPlayer);
      // console.log('Saved Player: ', savedPlayer)

      return savedPlayer;
    } catch (error) {
      console.log('Error in player createAndSave: ', error);
      throw error;
    }
  }

  public async findAll(query: FindPlayersQueryDTO) {
    const queryBuilder = this.createQueryBuilder('player');

    // Apply filters if provided

    // !! Exact comparison wtih =  !!
    if (query.playerName) {
      queryBuilder.andWhere('player.playerName = :playerName', {
        playerName: query.playerName,
      });
    }

    if (query.startggProfileImageURL) {
      queryBuilder.andWhere(
        'player.startggProfileImageURL = :startggProfileImageURL',
        {
          startggProfileImageURL: query.startggProfileImageURL,
        },
      );
    }

    if (query.country) {
      queryBuilder.andWhere('player.country = :country', {
        country: query.country,
      });
    }

    // Add sorting
    if (query.sortBy) {
      queryBuilder.orderBy(`player.${query.sortBy}`, query.order);
    }

    // Add limit
    queryBuilder.take(query.limit);

    // Get results and count
    const [players, total] = await queryBuilder.getManyAndCount();

    return {
      data: players,
      meta: {
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
