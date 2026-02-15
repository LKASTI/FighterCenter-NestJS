import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { SFSixRankedProfileService } from "@domain/sfsixRankedProfile";
import { SfsixRankedCharacterRankingService } from "@domain/sfsixRankedCharacterRanking/services/sfsix-ranked-character-ranking.service";
import { SFSixRankedCharacterService } from "@domain/sfsixRankedCharacter";
import { TaggedCacheService } from "@fgclegends/fightercenter-shared-nestjs";
import { CacheTags } from "@common/cache/cache-keys.util";
import * as path from "path";
import * as fs from "fs/promises";

export type RankedPlayerRecord = {
    key: number;
    CFN: string;
    Rank: number;
    MR: number;
    Character: string;
    Usercode: string;
    Country: string;
    League: string;
};

type ParsedFileData = {
    filename: string;
    phase: number;
    season: number;
    date: Date;
    records: RankedPlayerRecord[];
};

// Batch size for database operations
const BATCH_SIZE = 500;

@Injectable()
export class RankedDataParserService {
    private readonly logger = new Logger(RankedDataParserService.name);

    constructor(
        private readonly rankedProfileService: SFSixRankedProfileService,
        private readonly rankedCharacterService: SFSixRankedCharacterService,
        private readonly rankedCharacterRankingService: SfsixRankedCharacterRankingService,
        private readonly taggedCacheService: TaggedCacheService,
    ) {}

    /**
     * Parse all ranked data files in the directory with deadlock-safe processing
     *
     * Strategy to avoid deadlocks:
     * 1. Load all files into memory
     * 2. Extract and batch upsert ALL unique profiles (single pass, no parallelism)
     * 3. Extract and batch upsert ALL unique characters (single pass, no parallelism)
     * 4. Fetch character ID mappings once
     * 5. Process rankings file-by-file (rankings are unique per character+date)
     */
    async parseRankedFileDirectory() {
        const startTime = Date.now();
        const directoryPath = path.join(
            process.cwd(),
            "src/TEMPDATA/RankedData",
        );
        const directoryContents = await fs.readdir(directoryPath, "utf-8");

        // Phase 1: Load all files and parse metadata
        this.logger.log("Phase 1: Loading all files...");
        const allFileData: ParsedFileData[] = [];

        for (const file of directoryContents) {
            const metadata = this.parseFileMetadata(file);
            if (!metadata) {
                this.logger.warn(
                    `File ${file} does not match the format RankedPlayers_P[phase]_S[season]_YYYY-MM-DD.json`,
                );
                continue;
            }

            const filePath = path.join(directoryPath, file);
            const fileContent = await fs.readFile(filePath, "utf-8");
            const records: RankedPlayerRecord[] = JSON.parse(fileContent);

            allFileData.push({
                ...metadata,
                records,
            });
        }

        this.logger.log(`Loaded ${allFileData.length} files with ${allFileData.reduce((sum, f) => sum + f.records.length, 0)} total records`);

        // Phase 2: Extract and upsert ALL unique profiles across all files
        this.logger.log("Phase 2: Upserting all profiles...");
        const profilesMap = new Map<number, { usercode: number; cfn: string; flag: string }>();

        for (const fileData of allFileData) {
            for (const record of fileData.records) {
                const usercode = parseInt(record.Usercode);
                if (!profilesMap.has(usercode)) {
                    profilesMap.set(usercode, {
                        usercode,
                        cfn: record.CFN,
                        flag: record.Country,
                    });
                }
            }
        }

        const profiles = Array.from(profilesMap.values());
        this.logger.log(`Found ${profiles.length} unique profiles`);

        for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
            const chunk = profiles.slice(i, i + BATCH_SIZE);
            await this.rankedProfileService.batchUpsert(chunk);
            if ((i + BATCH_SIZE) % 2000 === 0 || i + BATCH_SIZE >= profiles.length) {
                this.logger.log(`Profiles progress: ${Math.min(i + BATCH_SIZE, profiles.length)}/${profiles.length}`);
            }
        }

        // Phase 3: Extract and upsert ALL unique characters across all files
        this.logger.log("Phase 3: Upserting all characters...");
        const charactersSet = new Set<string>();
        const characters: { usercode: number; characterName: string }[] = [];

        for (const fileData of allFileData) {
            for (const record of fileData.records) {
                const usercode = parseInt(record.Usercode);
                const key = `${usercode}-${record.Character}`;
                if (!charactersSet.has(key)) {
                    charactersSet.add(key);
                    characters.push({
                        usercode,
                        characterName: record.Character,
                    });
                }
            }
        }

        this.logger.log(`Found ${characters.length} unique characters`);

        for (let i = 0; i < characters.length; i += BATCH_SIZE) {
            const chunk = characters.slice(i, i + BATCH_SIZE);
            await this.rankedCharacterService.batchUpsert(chunk);
            if ((i + BATCH_SIZE) % 2000 === 0 || i + BATCH_SIZE >= characters.length) {
                this.logger.log(`Characters progress: ${Math.min(i + BATCH_SIZE, characters.length)}/${characters.length}`);
            }
        }

        // Phase 4: Fetch all character IDs for mapping
        this.logger.log("Phase 4: Fetching character ID mappings...");
        const characterMap = await this.rankedCharacterService.findByUsercodeAndCharacterBatch(characters);
        this.logger.log(`Loaded ${characterMap.size} character mappings`);

        // Phase 5: Process rankings for each file (safe to batch since rankings are unique per character+date)
        this.logger.log("Phase 5: Processing rankings...");
        let totalRankings = 0;

        for (let fileIndex = 0; fileIndex < allFileData.length; fileIndex++) {
            const fileData = allFileData[fileIndex];
            const rankings = this.buildRankingsFromFile(fileData, characterMap);

            for (let i = 0; i < rankings.length; i += BATCH_SIZE) {
                const chunk = rankings.slice(i, i + BATCH_SIZE);
                await this.rankedCharacterRankingService.batchUpsert(chunk);
            }

            totalRankings += rankings.length;
            this.logger.log(`File ${fileIndex + 1}/${allFileData.length}: ${fileData.filename} (${rankings.length} rankings)`);
        }

        // Invalidate all ranked data caches once after entire batch import
        await this.invalidateRankedCaches();

        const duration = Date.now() - startTime;
        this.logger.log(
            `Completed processing ${allFileData.length} files (${totalRankings} rankings) in ${duration}ms (${(duration / 1000).toFixed(1)}s)`,
        );
    }

    /**
     * Build rankings array from file data using character ID mapping
     */
    private buildRankingsFromFile(
        fileData: ParsedFileData,
        characterMap: Map<string, { sfsixRankedCharacterID: number }>,
    ): {
        sfsixRankedCharacterID: number;
        date: Date;
        rank: number;
        masterRating: number;
        league: string;
        phase: number;
        season: number;
    }[] {
        const rankings: {
            sfsixRankedCharacterID: number;
            date: Date;
            rank: number;
            masterRating: number;
            league: string;
            phase: number;
            season: number;
        }[] = [];

        for (const record of fileData.records) {
            const usercode = parseInt(record.Usercode);
            const key = `${usercode}-${record.Character}`;
            const character = characterMap.get(key);

            if (!character) {
                this.logger.warn(
                    `Character not found for usercode ${usercode} and character ${record.Character}`,
                );
                continue;
            }

            rankings.push({
                sfsixRankedCharacterID: character.sfsixRankedCharacterID,
                date: fileData.date,
                rank: record.Rank,
                masterRating: record.MR,
                league: this.parseLeague(record.League),
                phase: fileData.phase,
                season: fileData.season,
            });
        }

        return rankings;
    }

    /**
     * Parse a single JSON ranked file with batch processing
     */
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

        await this.processBatchRecords(jsonData, date, phase, season);

        // Invalidate all ranked data caches after import
        await this.invalidateRankedCaches();
    }

    /**
     * Parse file metadata from filename
     * Expected format: RankedPlayers_P[phase]_S[season]_YYYY-MM-DD.json
     */
    private parseFileMetadata(filename: string): { filename: string; phase: number; season: number; date: Date } | null {
        const [, phaseT, seasonT, dateT] = filename.split("_");
        if (
            !phaseT ||
            !seasonT ||
            !dateT ||
            phaseT[0] !== "P" ||
            seasonT[0] !== "S"
        ) {
            return null;
        }

        const phase = parseInt(phaseT.slice(1));
        const season = parseInt(seasonT.slice(1));
        const date = new Date(dateT.split(".")[0]);

        if (isNaN(phase) || isNaN(season) || isNaN(date.getTime())) {
            return null;
        }

        return { filename, phase, season, date };
    }

    /**
     * Process records in batches for optimal database performance (single file)
     * Used by parseJSONrankedFile for individual file processing
     */
    async processBatchRecords(
        records: RankedPlayerRecord[],
        date: Date,
        phase: number,
        season: number,
    ): Promise<void> {
        // Phase 1: Extract and upsert all unique profiles
        const profilesMap = new Map<
            number,
            { usercode: number; cfn: string; flag: string }
        >();
        for (const record of records) {
            const usercode = parseInt(record.Usercode);
            if (!profilesMap.has(usercode)) {
                profilesMap.set(usercode, {
                    usercode,
                    cfn: record.CFN,
                    flag: record.Country,
                });
            }
        }
        const profiles = Array.from(profilesMap.values());

        for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
            const chunk = profiles.slice(i, i + BATCH_SIZE);
            await this.rankedProfileService.batchUpsert(chunk);
        }

        // Phase 2: Extract and upsert all unique characters
        const charactersSet = new Set<string>();
        const characters: { usercode: number; characterName: string }[] = [];
        for (const record of records) {
            const usercode = parseInt(record.Usercode);
            const key = `${usercode}-${record.Character}`;
            if (!charactersSet.has(key)) {
                charactersSet.add(key);
                characters.push({
                    usercode,
                    characterName: record.Character,
                });
            }
        }

        for (let i = 0; i < characters.length; i += BATCH_SIZE) {
            const chunk = characters.slice(i, i + BATCH_SIZE);
            await this.rankedCharacterService.batchUpsert(chunk);
        }

        // Phase 3: Fetch all characters to get their IDs for rankings
        const characterMap =
            await this.rankedCharacterService.findByUsercodeAndCharacterBatch(characters);

        // Phase 4: Build and upsert all rankings
        const rankings: {
            sfsixRankedCharacterID: number;
            date: Date;
            rank: number;
            masterRating: number;
            league: string;
            phase: number;
            season: number;
        }[] = [];

        for (const record of records) {
            const usercode = parseInt(record.Usercode);
            const key = `${usercode}-${record.Character}`;
            const character = characterMap.get(key);

            if (!character) {
                this.logger.warn(
                    `Character not found for usercode ${usercode} and character ${record.Character}`,
                );
                continue;
            }

            rankings.push({
                sfsixRankedCharacterID: character.sfsixRankedCharacterID,
                date,
                rank: record.Rank,
                masterRating: record.MR,
                league: this.parseLeague(record.League),
                phase,
                season,
            });
        }

        for (let i = 0; i < rankings.length; i += BATCH_SIZE) {
            const chunk = rankings.slice(i, i + BATCH_SIZE);
            await this.rankedCharacterRankingService.batchUpsert(chunk);
        }
    }

    /**
     * Parse league string to normalized value
     */
    private parseLeague(league: string): string {
        if (league === "rank37_l.png" || league === "Legend") {
            return "Legend";
        }
        if (league === "rank36_l.png" || league === "Master") {
            return "Master";
        }
        return "N/A";
    }

    /**
     * Legacy method for parsing individual records (kept for backwards compatibility)
     * Consider using processBatchRecords for better performance
     */
    async parseRankedPlayerRecord(
        record: RankedPlayerRecord,
        date: Date,
        phase: number,
        season: number,
    ) {
        const parsedUsercode = parseInt(record.Usercode);
        const parsedLeague = this.parseLeague(record.League);

        let rankedProfile =
            await this.rankedProfileService.findById(parsedUsercode);
        if (!rankedProfile) {
            rankedProfile = await this.rankedProfileService.create({
                usercode: parsedUsercode,
                flag: record.Country,
                cfn: record.CFN,
            });
        }

        let rankedCharacter = await this.rankedCharacterService.findOneBy({
            characterName: record.Character,
            usercode: parsedUsercode,
        });
        if (!rankedCharacter) {
            rankedCharacter = await this.rankedCharacterService.create({
                characterName: record.Character,
                usercode: parsedUsercode,
            });
        }

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

    /**
     * Invalidate all ranked data caches after import
     */
    private async invalidateRankedCaches(): Promise<void> {
        await this.taggedCacheService.invalidateByTag(
            CacheTags.ranked.allRankedData(),
        );
    }
}
