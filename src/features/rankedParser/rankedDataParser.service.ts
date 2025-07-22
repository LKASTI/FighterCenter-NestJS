import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { SFSixRankedProfileService } from "../../domain/sfsixRankedProfile/sfsixRankedProfile.service";
import { SFSixRankedCharacterRankingService } from "../../domain/sfsixRankedCharacterRanking/sfsixRankedCharacterRanking.service";
import { SFSixRankedCharacterService } from "../../domain/sfsixRankedCharacter/sfsixRankedCharacter.service";
import * as path from "path";
import * as fs from "fs/promises";

type RankedPlayerRecord = {
    key: number;
    CFN: string;
    Rank: number;
    MR: number;
    Character: string;
    Usercode: string;
    Country: string;
    League: string;
};

@Injectable()
export class RankedDataParserService {
    constructor(
        private readonly rankedProfileService: SFSixRankedProfileService,
        private readonly rankedCharacterService: SFSixRankedCharacterService,
        private readonly rankedCharacterRankingService: SFSixRankedCharacterRankingService,
    ) {}

    async parseRankedFileDirectory() {
        const directoryPath = path.join(
            process.cwd(),
            "src/TEMPDATA/RankedData",
        );
        const directoryContents = await fs.readdir(directoryPath, "utf-8");
        for (const file of directoryContents) {
            const [, phaseT, seasonT, dateT] = file.split("_");
            if (
                !phaseT ||
                !seasonT ||
                !dateT ||
                phaseT[0] !== "P" ||
                seasonT[0] !== "S"
            ) {
                console.log(
                    `File ${file} does not match the format P[phase]_S[season]_YYYY-MM-DD.json`,
                );
                continue;
            }
            const phase = parseInt(phaseT[1]);
            const season = parseInt(seasonT[1]);
            const date = new Date(dateT.split(".")[0]);
            // console.log(phase, season, date)

            const jsonData: RankedPlayerRecord[] = JSON.parse(
                await fs.readFile(path.join(directoryPath, file), "utf-8"),
            );

            for (const record of jsonData) {
                await this.parseRankedPlayerRecord(record, date, phase, season);
            }
            console.log(`File ${file} parsed`);
        }
    }

    async parseJSONrankedFile(
        filename: string,
        date: Date,
        phase: number,
        season: number,
    ) {
        const filePath = path.join(
            process.cwd(),
            "src/TEMPDATA/RankedData",
            `${filename}.json`,
        );
        const fileContent = await fs.readFile(filePath, "utf-8");
        const jsonData: RankedPlayerRecord[] = JSON.parse(fileContent);

        if (!jsonData)
            throw new NotFoundException(
                `Ranked data file: ${filename} does not exist under ${filePath}`,
            );

        for (const record of jsonData) {
            await this.parseRankedPlayerRecord(record, date, phase, season);
        }
    }

    async parseRankedPlayerRecord(
        record: RankedPlayerRecord,
        date: Date,
        phase: number,
        season: number,
    ) {
        // format usercode and league
        const parsedUsercode = parseInt(record.Usercode);
        const parsedLeague =
            record.League === "rank37_l.png" || record.League === "Legend"
                ? "Legend"
                : record.League === "rank36_l.png" || record.League === "Master"
                  ? "Master"
                  : "N/A";
        // check if profile exists using usercode
        let rankedProfile =
            await this.rankedProfileService.findById(parsedUsercode);
        if (!rankedProfile) {
            // create ranked profile
            // console.log("i = " + i + " Creating ranked profile " + parsedUsercode)
            rankedProfile = await this.rankedProfileService.create({
                usercode: parsedUsercode,
                flag: record.Country,
                cfn: record.CFN,
            });
        }

        // check if character exists under profile
        let rankedCharacter = await this.rankedCharacterService.findOneBy({
            characterName: record.Character,
            usercode: parsedUsercode,
        });
        if (!rankedCharacter) {
            // create ranked character
            rankedCharacter = await this.rankedCharacterService.create({
                characterName: record.Character,
                usercode: parsedUsercode,
            });
        }

        // create new ranked_character_ranking if record for given date and character does not exist already
        const rankingExists =
            (await this.rankedCharacterRankingService.findOneBy({
                sfsixRankedCharacterID: rankedCharacter.sfsixRankedCharacterID,
                date: date,
            })) !== null;
        if (!rankingExists) {
            await this.rankedCharacterRankingService.create({
                sfsixRankedCharacterID: rankedCharacter.sfsixRankedCharacterID,
                date: date,
                rank: record.Rank,
                masterRating: record.MR,
                league: parsedLeague,
                phase: phase,
                season: season,
            });
        }
    }
}
