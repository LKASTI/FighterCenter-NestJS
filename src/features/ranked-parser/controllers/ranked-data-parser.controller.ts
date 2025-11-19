import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ParseRankedFileDto } from "../dtos/request/parse-ranked-file.dto";
import { RankedDataParserService } from "../services/ranked-data-parser.service";
import { ApiRankedParserPost } from "../decorators/ranked-parser-swagger.decorators";

@ApiTags("Ranked Data Parser")
@Controller("rankedDataParser")
export class RankedDataParserController {
    constructor(private readonly service: RankedDataParserService) {}

    @Post("parseJSONrankedFile")
    @ApiRankedParserPost(
        "Parse a specific JSON ranked data file and store in database",
        undefined,
        true // This endpoint is disabled
    )
    public async parseJSONrankedFile(@Body() body: ParseRankedFileDto) {
        return this.service.parseJSONrankedFile(
            body.filename,
            body.date,
            body.phase,
            body.season,
        );
    }

    @Post("parseRankedFileDirectory")
    @ApiRankedParserPost(
        "Parse all JSON ranked data files in the directory and store in database"
    )
    public async parseRankedFileDirectory() {
        return this.service.parseRankedFileDirectory();
    }
}
