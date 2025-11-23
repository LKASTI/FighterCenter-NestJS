import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateTournamentImportAuditLogTable1732285520000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "tournament_import_audit_log",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "tournament_series_id",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["success", "failed", "rolled_back"],
                        isNullable: false,
                    },
                    {
                        name: "error_message",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "error_stack",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "created_entities",
                        type: "jsonb",
                        isNullable: false,
                    },
                    {
                        name: "start_time",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "end_time",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "duration_ms",
                        type: "integer",
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Create index on tournament_series_id for fast lookup
        await queryRunner.createIndex(
            "tournament_import_audit_log",
            new TableIndex({
                name: "IDX_tournament_import_audit_log_series_id",
                columnNames: ["tournament_series_id"],
            }),
        );

        // Create index on status for filtering failed imports
        await queryRunner.createIndex(
            "tournament_import_audit_log",
            new TableIndex({
                name: "IDX_tournament_import_audit_log_status",
                columnNames: ["status"],
            }),
        );

        // Create index on start_time for chronological queries
        await queryRunner.createIndex(
            "tournament_import_audit_log",
            new TableIndex({
                name: "IDX_tournament_import_audit_log_start_time",
                columnNames: ["start_time"],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(
            "tournament_import_audit_log",
            "IDX_tournament_import_audit_log_start_time",
        );
        await queryRunner.dropIndex(
            "tournament_import_audit_log",
            "IDX_tournament_import_audit_log_status",
        );
        await queryRunner.dropIndex(
            "tournament_import_audit_log",
            "IDX_tournament_import_audit_log_series_id",
        );
        await queryRunner.dropTable("tournament_import_audit_log");
    }
}
