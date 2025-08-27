import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { RankedFileParserDTO } from "src/dtos/rankedDataParser.dto";
import { RankedDataParserService } from "src/features/rankedParser/rankedDataParser.service";
import { FeatureFlagGuard } from "../authentication/guards/feature-flag.guard";
import { DisableEndpoint } from "../decorators/endpoint-status-toggles";

@Controller("rankedDataParser")
@UseGuards(FeatureFlagGuard)
export class RankedDataParserController {
    constructor(private readonly service: RankedDataParserService) {}

    @DisableEndpoint()
    @Post("parseJSONrankedFile")
    public async parseJSONrankedFile(@Body() body: RankedFileParserDTO) {
        // TODO: validate filename format and existence

        return this.service.parseJSONrankedFile(
            body.filename,
            body.date,
            body.phase,
            body.season,
        );
    }

    @Post("parseRankedFileDirectory")
    public async parseRankedFileDirectory() {
        return this.service.parseRankedFileDirectory();
    }
}
