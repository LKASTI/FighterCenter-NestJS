import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateUserDataTables1763325000000 implements MigrationInterface {
    name = 'CreateUserDataTables1763325000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create note_book table
        await queryRunner.createTable(
            new Table({
                name: "note_book",
                columns: [
                    {
                        name: "note_book_id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid()",
                    },
                    {
                        name: "startgg_user_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                        default: "'My Notes'",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "content",
                        type: "jsonb",
                        isNullable: false,
                    },
                    {
                        name: "is_public",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "view_count",
                        type: "integer",
                        default: 0,
                    },
                    {
                        name: "tags",
                        type: "text[]",
                        default: "'{}'",
                    },
                    {
                        name: "created_at",
                        type: "timestamptz",
                        default: "NOW()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamptz",
                        default: "NOW()",
                    },
                ],
            }),
            true
        );

        // Add foreign key for note_book -> startgg_user
        await queryRunner.createForeignKey(
            "note_book",
            new TableForeignKey({
                columnNames: ["startgg_user_id"],
                referencedTableName: "startgg_user",
                referencedColumnNames: ["startgg_user_id"],
                onDelete: "CASCADE",
            })
        );

        // Add unique constraint for note_book
        await queryRunner.createIndex(
            "note_book",
            new TableIndex({
                name: "idx_note_book_user_title",
                columnNames: ["startgg_user_id", "title"],
                isUnique: true,
            })
        );

        // Add GIN index for JSONB content searching in note_book
        await queryRunner.query(
            `CREATE INDEX idx_note_book_content_gin ON note_book USING GIN (content)`
        );

        // Add index for public notebooks
        await queryRunner.query(
            `CREATE INDEX idx_note_book_public ON note_book (is_public) WHERE is_public = TRUE`
        );

        // Create tech_library table
        await queryRunner.createTable(
            new Table({
                name: "tech_library",
                columns: [
                    {
                        name: "tech_library_id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid()",
                    },
                    {
                        name: "startgg_user_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "character_code",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                    },
                    {
                        name: "brand",
                        type: "varchar",
                        length: "10",
                        default: "'sf6'",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "content",
                        type: "jsonb",
                        isNullable: false,
                    },
                    {
                        name: "entry_count",
                        type: "integer",
                        default: 0,
                    },
                    {
                        name: "category_count",
                        type: "integer",
                        default: 0,
                    },
                    {
                        name: "is_public",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "view_count",
                        type: "integer",
                        default: 0,
                    },
                    {
                        name: "tags",
                        type: "text[]",
                        default: "'{}'",
                    },
                    {
                        name: "last_synced_at",
                        type: "timestamptz",
                        default: "NOW()",
                    },
                    {
                        name: "created_at",
                        type: "timestamptz",
                        default: "NOW()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamptz",
                        default: "NOW()",
                    },
                ],
            }),
            true
        );

        // Add foreign key for tech_library -> startgg_user
        await queryRunner.createForeignKey(
            "tech_library",
            new TableForeignKey({
                columnNames: ["startgg_user_id"],
                referencedTableName: "startgg_user",
                referencedColumnNames: ["startgg_user_id"],
                onDelete: "CASCADE",
            })
        );

        // Add unique constraint for tech_library
        await queryRunner.createIndex(
            "tech_library",
            new TableIndex({
                name: "idx_tech_library_user_character_brand",
                columnNames: ["startgg_user_id", "character_code", "brand"],
                isUnique: true,
            })
        );

        // Add GIN index for JSONB content searching in tech_library
        await queryRunner.query(
            `CREATE INDEX idx_tech_library_content_gin ON tech_library USING GIN (content)`
        );

        // Add index for public tech libraries
        await queryRunner.query(
            `CREATE INDEX idx_tech_library_public ON tech_library (is_public, character_code) WHERE is_public = TRUE`
        );

        // Create shared_tech_entry table
        await queryRunner.createTable(
            new Table({
                name: "shared_tech_entry",
                columns: [
                    {
                        name: "shared_tech_entry_id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid()",
                    },
                    {
                        name: "startgg_user_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "character_code",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                    },
                    {
                        name: "entry_type",
                        type: "varchar",
                        length: "20",
                        isNullable: false,
                    },
                    {
                        name: "entry_data",
                        type: "jsonb",
                        isNullable: false,
                    },
                    {
                        name: "share_code",
                        type: "varchar",
                        length: "12",
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: "view_count",
                        type: "integer",
                        default: 0,
                    },
                    {
                        name: "is_public",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamptz",
                        default: "NOW()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamptz",
                        default: "NOW()",
                    },
                ],
            }),
            true
        );

        // Add foreign key for shared_tech_entry -> startgg_user
        await queryRunner.createForeignKey(
            "shared_tech_entry",
            new TableForeignKey({
                columnNames: ["startgg_user_id"],
                referencedTableName: "startgg_user",
                referencedColumnNames: ["startgg_user_id"],
                onDelete: "CASCADE",
            })
        );

        // Add indexes for shared_tech_entry
        await queryRunner.createIndex(
            "shared_tech_entry",
            new TableIndex({
                name: "idx_shared_tech_entry_user",
                columnNames: ["startgg_user_id"],
            })
        );

        await queryRunner.createIndex(
            "shared_tech_entry",
            new TableIndex({
                name: "idx_shared_tech_entry_character",
                columnNames: ["character_code"],
            })
        );

        await queryRunner.createIndex(
            "shared_tech_entry",
            new TableIndex({
                name: "idx_shared_tech_entry_type",
                columnNames: ["entry_type"],
            })
        );

        await queryRunner.query(
            `CREATE INDEX idx_shared_tech_entry_public ON shared_tech_entry (is_public) WHERE is_public = TRUE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order (to handle foreign key constraints)
        await queryRunner.dropTable("shared_tech_entry", true);
        await queryRunner.dropTable("tech_library", true);
        await queryRunner.dropTable("note_book", true);
    }
}
