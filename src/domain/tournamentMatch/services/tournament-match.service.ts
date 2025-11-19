import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TournamentMatchRepository } from "../repositories/tournament-match.repository";
import { CreateTournamentMatchDto } from "../dtos/request/create-tournament-match.dto";
import { UpdateTournamentMatchDto } from "../dtos/request/update-tournament-match.dto";
import { FindTournamentMatchesQueryDto } from "../dtos/request/find-tournament-matches-query.dto";

@Injectable()
export class TournamentMatchService {
    constructor(
        @InjectRepository(TournamentMatchRepository)
        private readonly tournamentMatchRepository: TournamentMatchRepository,
    ) {}

    public async create(createTournamentMatch: CreateTournamentMatchDto) {
        return await this.tournamentMatchRepository.createAndSave(
            createTournamentMatch,
        );
    }

    public async findAll(query: FindTournamentMatchesQueryDto) {
        return await this.tournamentMatchRepository.findAll(query);
    }

    public async findById(id: number) {
        return await this.tournamentMatchRepository.findOneBy({
            tournamentMatchID: id,
        });
    }

    public async update(
        id: number,
        updateTournamentMatchDTO: UpdateTournamentMatchDto,
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
