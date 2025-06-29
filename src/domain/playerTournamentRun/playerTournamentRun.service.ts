import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerTournamentRunRepository } from 'src/domain/playerTournamentRun/playerTournamentRun.repository';
import { PlayerTournamentRun } from 'src/domain/entities/playerTournamentRun.entity';
import {
	CreatePlayerTournamentRunDTO,
	FindPlayerTournamentRunsQueryDTO,
	UpdatePlayerTournamentRunDTO,
} from 'src/dtos/playerTournamentRun.dto';

@Injectable()
export class PlayerTournamentRunService {
	constructor(
		@InjectRepository(PlayerTournamentRunRepository)
		private readonly playerTournamentRunRepository: PlayerTournamentRunRepository,
	) {}

	public async create(
		createPlayerTournamentRunDTO: CreatePlayerTournamentRunDTO,
	): Promise<PlayerTournamentRun> {
		return await this.playerTournamentRunRepository.createAndSave(
			createPlayerTournamentRunDTO,
		);
	}

	public async findAll(query: FindPlayerTournamentRunsQueryDTO) {
		return await this.playerTournamentRunRepository.findAll(query);
	}

	public async findAllForSeriesTable(eventID: number) {
		const tmp =
			await this.playerTournamentRunRepository.findAllForSeriesTable(eventID);
		// console.log(tmp)
		return tmp;
	}

	public async findByPlayerAndTournamentID(
		playerID: number,
		tournamentID: number,
	): Promise<PlayerTournamentRun> {
		return await this.playerTournamentRunRepository.findOneBy({
			playerID: playerID,
			tournamentID: tournamentID,
		});
	}

	public async findAllByTournamentID(tournamentID: number) {
		return await this.playerTournamentRunRepository.findAllByTournamentID(
			tournamentID,
		);
	}

	public async update(
		playerID: number,
		tournamentID: number,
		UpdatePlayerTournamentRunDTO: UpdatePlayerTournamentRunDTO,
	): Promise<PlayerTournamentRun> {
		const playerTournamentRun =
			await this.playerTournamentRunRepository.findOneBy({
				playerID: playerID,
				tournamentID: tournamentID,
			});

		if (!playerTournamentRun) {
			return null;
		}

		await this.playerTournamentRunRepository.update(
			{ playerID: playerID, tournamentID: tournamentID },
			UpdatePlayerTournamentRunDTO,
		);

		return await this.playerTournamentRunRepository.findOneBy({
			playerID: playerID,
			tournamentID: tournamentID,
		});
	}

	public async updateCharactersUsed(
		playerID: number,
		tournamentID: number,
		characters: string [],
	): Promise<PlayerTournamentRun> {
		const playerTournamentRun =
			await this.playerTournamentRunRepository.findOneBy({
				playerID: playerID,
				tournamentID: tournamentID,
			});

		if (!playerTournamentRun) {
			return null;
		}

		const currentCharactersUsed = playerTournamentRun.charactersUsed || [];
		const updatedCharactersUsed = Array.from(
			new Set([...currentCharactersUsed, ...characters]),
		);

		await this.playerTournamentRunRepository.update(
			{ playerID: playerID, tournamentID: tournamentID },
			{ charactersUsed: updatedCharactersUsed },
		)

		return await this.playerTournamentRunRepository.findOneBy({
			playerID: playerID,
			tournamentID: tournamentID,
		});
	}

	public async remove(
		playerID: number,
		tournamentID: number,
	): Promise<boolean> {
		const result = await this.playerTournamentRunRepository.delete({
			playerID: playerID,
			tournamentID: tournamentID,
		});
		return result.affected > 0;
	}
}
