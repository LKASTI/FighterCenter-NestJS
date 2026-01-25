import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMissingColumnsToNoteBook1764400000000 implements MigrationInterface {
    name = 'AddMissingColumnsToNoteBook1764400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add character_code column
        await queryRunner.addColumn(
            "note_book",
            new TableColumn({
                name: "character_code",
                type: "text",
                isNullable: true,
            })
        );

        // Add brand column
        await queryRunner.addColumn(
            "note_book",
            new TableColumn({
                name: "brand",
                type: "varchar",
                length: "10",
                default: "'sf6'",
            })
        );

        // Add color column
        await queryRunner.addColumn(
            "note_book",
            new TableColumn({
                name: "color",
                type: "text",
                isNullable: true,
            })
        );

        // Add cover_image_url column
        await queryRunner.addColumn(
            "note_book",
            new TableColumn({
                name: "cover_image_url",
                type: "text",
                isNullable: true,
            })
        );

        // Update the unique constraint to include brand
        // First drop the old constraint
        await queryRunner.query(
            `DROP INDEX IF EXISTS idx_note_book_user_title`
        );

        // Create new unique constraint including brand
        await queryRunner.query(
            `CREATE UNIQUE INDEX idx_note_book_user_title_brand ON note_book (startgg_user_id, title, brand)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restore old unique constraint
        await queryRunner.query(
            `DROP INDEX IF EXISTS idx_note_book_user_title_brand`
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX idx_note_book_user_title ON note_book (startgg_user_id, title)`
        );

        // Remove columns
        await queryRunner.dropColumn("note_book", "cover_image_url");
        await queryRunner.dropColumn("note_book", "color");
        await queryRunner.dropColumn("note_book", "brand");
        await queryRunner.dropColumn("note_book", "character_code");
    }
}
