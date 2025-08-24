import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { TournamentDataParserService } from "src/features/tournamentImporter/tournamentDataParser.service";
import {
    StartGGTournamentDataV2ParserDTO,
} from "src/dtos/tournamentDataParser.dto";
import { SeriesAuthGuard } from "../authentication/guards/seriesAuth.guard";
import { Roles } from "../decorators/roles.decorator";
import { ApiBody, ApiParam, ApiSecurity } from "@nestjs/swagger";
import { TournamentManagerService } from "../features/tournamentImporter/tournamentManager.service";
import { UpdateTournamentDTO } from "../dtos/tournament.dto";
import { UpdateSeriesTournamentDTO } from "../features/tournamentImporter/tournamentManager.dto";

@Controller("tournamentDataParser")
export class TournamentDataParserController {
    constructor(
        private readonly service: TournamentDataParserService,
        private readonly tournamentManagerService: TournamentManagerService
    ) {}

    @Post("parseStartGGTournamentData_V2/:tournamentSeriesId")
    @ApiSecurity('x-auth-token')
    @ApiBody({ type: StartGGTournamentDataV2ParserDTO, })
    @ApiParam({ name: "tournamentSeriesId", type: String, description: "ID of the tournament series to parse data for" })
    @UseGuards(SeriesAuthGuard)
    @Roles("TOURNAMENT_ORGANIZER", "SUPER_ADMIN")
    async parseStartGGTournamentDataV2(
        @Param("tournamentSeriesId") tournamentSeriesId: string,
        @Body() body: StartGGTournamentDataV2ParserDTO,
        @Req() req: Request
    ) {
        return this.service.parseStartGGTournamentDataV2(body, req, parseInt(tournamentSeriesId));
    }

    @Delete("deleteTournamentData/:tournamentSeriesId/:tournamentId")
    @ApiSecurity('x-auth-token')
    @UseGuards(SeriesAuthGuard)
    @Roles("TOURNAMENT_ORGANIZER", "SUPER_ADMIN")
    async deleteTournamentData(
        @Param("tournamentSeriesId", ParseIntPipe) tournamentSeriesId: number,
        @Param("tournamentId", ParseIntPipe) tournamentId: number
    ) {
        return await this.tournamentManagerService.deleteTournamentData(tournamentSeriesId, tournamentId);
    }

    @Post("updateTournamentData/:tournamentSeriesId/:tournamentId")
    @ApiSecurity("x-auth-token")
    @UseGuards(SeriesAuthGuard)
    @Roles("TOURNAMENT_ORGANIZER", "SUPER_ADMIN")
    async updateTournament(
        @Param("tournamentSeriesId", ParseIntPipe) tournamentSeriesId: number,
        @Param("tournamentId", ParseIntPipe) tournamentId: number,
        @Body(new ValidationPipe({ transform: true }))
        updateSeriesTournamentDto: UpdateSeriesTournamentDTO
    ) {
        return await this.tournamentManagerService.updateTournamentData(
            tournamentId,
            tournamentSeriesId,
            updateSeriesTournamentDto
        )
    }

    @Get("healthcheck")
    @ApiSecurity('x-auth-token')
    @UseGuards(SeriesAuthGuard)
    @Roles("TOURNAMENT_ORGANIZER", "SUPER_ADMIN")
    async healthcheck(
    ) {
        return "TournamentDataParser controller ok";
    }
}
