import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TournamentDataParserService } from 'src/features/tournamentImporter/TournamentDataParser.service';
import {
	// StartGGTournamentDataParserDTO,
	StartGGTournamentDataV2ParserDTO,
} from 'src/dtos/TournamentDataParser.dto';
import { SeriesAuthGuard } from "../authentication/guards/jwtAuth.guard";
import { Roles } from "../decorators/roles.decorator";

@Controller('tournamentDataParser')
export class TournamentDataParserController {
	constructor(private readonly service: TournamentDataParserService) {}

	// Deprecated
	// @Post('parseStartGGTournamentData')
	// async parseStartGGTournamentData(
	// 	@Body() body: StartGGTournamentDataParserDTO,
	// ) {
	// 	return this.service.parseStartGGTournamentData(body);
	// }

	@Post('parseStartGGTournamentData_V2/:tournamentSeriesId')
	@UseGuards(SeriesAuthGuard)
	@Roles('TOURNAMENT_ORGANIZER', 'SUPER_ADMIN')
	async parseStartGGTournamentDataV2(
		@Param('tournamentSeriesId') tournamentSeriesId: string,
		@Body() body: StartGGTournamentDataV2ParserDTO,
	) {
		return this.service.parseStartGGTournamentDataV2(body);
	}

    @Get('healthcheck')
    @UseGuards(SeriesAuthGuard)
    @Roles('TOURNAMENT_ORGANIZER', 'SUPER_ADMIN')
    async healthcheck() {
        return 'TournamentDataParser controller ok';
    }
}
