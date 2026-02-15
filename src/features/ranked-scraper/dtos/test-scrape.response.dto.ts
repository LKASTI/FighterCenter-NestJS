import { ApiProperty } from "@nestjs/swagger";

class TestScrapeRecordDTO {
    @ApiProperty({ description: "Sequential key", example: 1 })
    key: number;

    @ApiProperty({ description: "Player CFN (Capcom Fighters Network name)", example: "hinao" })
    CFN: string;

    @ApiProperty({ description: "Ranked position", example: 1 })
    Rank: number;

    @ApiProperty({ description: "Master Rate points", example: 2160 })
    MR: number;

    @ApiProperty({ description: "Character name", example: "Luke" })
    Character: string;

    @ApiProperty({ description: "Buckler usercode", example: "2318346421" })
    Usercode: string;

    @ApiProperty({ description: "Country name", example: "Japan" })
    Country: string;

    @ApiProperty({ description: "League tier", example: "Legend" })
    League: string;
}

export class TestScrapeResponseDTO {
    @ApiProperty({
        description: "Number of records parsed from the page",
        example: 20,
    })
    recordCount: number;

    @ApiProperty({
        description: "Page number that was fetched",
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: "Parsed player records",
        type: [TestScrapeRecordDTO],
    })
    records: TestScrapeRecordDTO[];
}
