import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { TournamentDataParserService } from "src/features/tournamentImporter/tournamentDataParser.service";
import {
    StartGGTournamentDataV2ParserDTO,
} from "src/dtos/tournamentDataParser.dto";
import { SeriesAuthGuard } from "../authentication/guards/seriesAuth.guard";
import { Roles } from "../decorators/roles.decorator";

@Controller("tournamentDataParser")
export class TournamentDataParserController {
    constructor(private readonly service: TournamentDataParserService) {}

    @Post("parseStartGGTournamentData_V2/:tournamentSeriesId")
    @UseGuards(SeriesAuthGuard)
    @Roles("TOURNAMENT_ORGANIZER", "SUPER_ADMIN")
    async parseStartGGTournamentDataV2(
        @Param("tournamentSeriesId") tournamentSeriesId: string,
        @Body() body: StartGGTournamentDataV2ParserDTO,
        @Req() req: Request
    ) {
        return this.service.parseStartGGTournamentDataV2(body, req, parseInt(tournamentSeriesId));
    }

    @Get("healthcheck")
    @UseGuards(SeriesAuthGuard)
    @Roles("TOURNAMENT_ORGANIZER", "SUPER_ADMIN")
    async healthcheck(
    ) {
        return "TournamentDataParser controller ok";
    }
}
