import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { TournamentDataParserService } from "../services/tournament-data-parser.service";
import {
    StartGGTournamentDataV2ParserDTO,
    UploadTop8GraphicDto,
} from "../dtos/request/tournament-data-parser.dto";
import { SeriesAuthGuard } from "@authentication/guards/seriesAuth.guard";
import { Roles } from "@decorators/roles.decorator";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { TournamentManagerService } from "../services/tournament-manager.service";
import { UpdateSeriesTournamentDTO } from "../dtos/request/tournament-manager.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { Throttle } from "@nestjs/throttler";
import { imageUploadConfig } from "@common/interceptors/image-upload.config";
import { TournamentGraphicUploadService } from "../services/tournament-graphic-upload.service";
import { validateImageFile } from "@common/utils/file-validation.util";

@ApiTags("Tournament Data Parser")

@Controller("tournamentDataParser")
export class TournamentDataParserController {
    constructor(
        private readonly service: TournamentDataParserService,
        private readonly tournamentManagerService: TournamentManagerService,
        private readonly tournamentGraphicUploadService: TournamentGraphicUploadService
    ) {}

    @Post("uploadTop8Graphic/:tournamentSeriesId")
    @ApiSecurity('x-auth-token')
    @UseGuards(SeriesAuthGuard)
    @Roles("TOURNAMENT_ORGANIZER", "SUPER_ADMIN")
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @UseInterceptors(FileInterceptor('imageFile', imageUploadConfig))
    async uploadTop8Graphic(
        @Param("tournamentSeriesId", ParseIntPipe) tournamentSeriesId: number,
        @UploadedFile() file: Express.Multer.File,
        @Body(new ValidationPipe({ transform: true })) body: UploadTop8GraphicDto
    ) {
        if (!file) {
            throw new BadRequestException('No image file provided');
        }

        if (!body.startggUrl) {
            throw new BadRequestException('startggUrl is required');
        }

        if (!body.seriesName) {
            throw new BadRequestException('seriesName is required');
        }

        // Validate file content via magic bytes (defense in depth)
        await validateImageFile(file);

        try {
            const imageUrl = await this.tournamentGraphicUploadService.uploadGraphic(
                body.seriesName,
                tournamentSeriesId,
                body.startggUrl,
                file,
                body.isGenerated
            );

            return { imageUrl };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Failed to upload image to R2',
                error.message
            );
        }
    }

    @Post("parseStartGGTournamentData_V2/:tournamentSeriesId")
    @ApiSecurity('x-auth-token')
    @UseGuards(SeriesAuthGuard)
    @Roles("TOURNAMENT_ORGANIZER", "SUPER_ADMIN")
    async parseStartGGTournamentDataV2(
        @Param("tournamentSeriesId") tournamentSeriesId: string,
        @Body() body: StartGGTournamentDataV2ParserDTO,
        @Req() req: Request
    ) {
        return this.service.tournamentImporterEntry(body, req, parseInt(tournamentSeriesId));
    }

    @Delete("deleteTournamentData/:tournamentSeriesId/:tournamentId")
    @ApiSecurity('x-auth-token')
    @UseGuards(SeriesAuthGuard)
    @Roles("TOURNAMENT_ORGANIZER", "SUPER_ADMIN")
    async deleteTournamentData(
        @Param("tournamentSeriesId", ParseIntPipe) tournamentSeriesId: number,
        @Param("tournamentId", ParseIntPipe) tournamentId: number,
        @Req() req: any
    ) {
        const updatedBy = req.user?.userId;
        return await this.tournamentManagerService.deleteTournamentData(tournamentSeriesId, tournamentId, updatedBy);
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
