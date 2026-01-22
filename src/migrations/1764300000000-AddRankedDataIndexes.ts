import { MigrationInterface, QueryRunner, TableIndex, TableUnique } from "typeorm";

export class AddRankedDataIndexes1764300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Unique constraint on sf6_ranked_character for upsert support
        // Prevents duplicate character entries for the same user
        await queryRunner.createUniqueConstraint(
            "sf6_ranked_character",
            new TableUnique({
                name: "UQ_ranked_character_usercode_character",
                columnNames: ["usercode", "character_name"],
            }),
        );

        // Index on sf6_ranked_character for fast lookups by usercode + character_name
        // Used in: findOneBy({ characterName, usercode }) during record parsing
        await queryRunner.createIndex(
            "sf6_ranked_character",
            new TableIndex({
                name: "IDX_ranked_character_usercode_character",
                columnNames: ["usercode", "character_name"],
            }),
        );

        // Unique constraint on sf6_ranked_character_ranking for upsert support
        // Prevents duplicate ranking entries for the same character on the same date
        await queryRunner.createUniqueConstraint(
            "sf6_ranked_character_ranking",
            new TableUnique({
                name: "UQ_ranking_character_date",
                columnNames: ["sf6_ranked_character_id", "date"],
            }),
        );

        // Composite index on sf6_ranked_character_ranking for duplicate checking
        // Used in: findOneBy({ sfsixRankedCharacterID, date }) during record parsing
        await queryRunner.createIndex(
            "sf6_ranked_character_ranking",
            new TableIndex({
                name: "IDX_ranking_character_date",
                columnNames: ["sf6_ranked_character_id", "date"],
            }),
        );

        // Index on sf6_ranked_character_ranking for phase/season queries
        // Used in: findAllWeeklyDatesByPhase, findAllRankedPlayerAndCharacterInfoByDateAndPhase
        await queryRunner.createIndex(
            "sf6_ranked_character_ranking",
            new TableIndex({
                name: "IDX_ranking_phase_season",
                columnNames: ["phase", "season"],
            }),
        );

        // Index on sf6_ranked_character_ranking for date filtering
        // Used in: findAllRankedPlayerAndCharacterInfoByDateAndPhase
        await queryRunner.createIndex(
            "sf6_ranked_character_ranking",
            new TableIndex({
                name: "IDX_ranking_date",
                columnNames: ["date"],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(
            "sf6_ranked_character_ranking",
            "IDX_ranking_date",
        );
        await queryRunner.dropIndex(
            "sf6_ranked_character_ranking",
            "IDX_ranking_phase_season",
        );
        await queryRunner.dropIndex(
            "sf6_ranked_character_ranking",
            "IDX_ranking_character_date",
        );
        await queryRunner.dropUniqueConstraint(
            "sf6_ranked_character_ranking",
            "UQ_ranking_character_date",
        );
        await queryRunner.dropIndex(
            "sf6_ranked_character",
            "IDX_ranked_character_usercode_character",
        );
        await queryRunner.dropUniqueConstraint(
            "sf6_ranked_character",
            "UQ_ranked_character_usercode_character",
        );
    }
}
