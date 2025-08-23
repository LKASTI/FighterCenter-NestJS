import { Injectable, NotFoundException } from "@nestjs/common";
import { TournamentManagerRepository } from "./tournamentManager.repository";
import { TournamentService } from "../../domain/tournament/tournament.service";
import { FindTournamentsQueryDTO } from "../../dtos/tournament.dto";

@Injectable()
export class TournamentManagerService {
    constructor(
        private readonly tournamentManagerRepository: TournamentManagerRepository,
        private readonly tournamentService: TournamentService
    ) {}

    public async deleteTournamentData(tournamentSeriesId: number, tournamentId: number) {
        // check if tournament exists for series
        const tournamentQuery = new FindTournamentsQueryDTO();
        tournamentQuery.eventID = tournamentSeriesId;
        tournamentQuery.tournamentID = tournamentId;
        const res = await this.tournamentService.findAll(tournamentQuery);
        if(!res.data || (res.data && res.data.length === 0)) {
            throw new NotFoundException("Tournament not found for the given series");
        }

        return await this.tournamentManagerRepository.deleteTournamentData(tournamentId);
    }

}