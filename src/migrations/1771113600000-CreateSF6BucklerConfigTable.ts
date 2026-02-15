import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSF6BucklerConfigTable1771113600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "sf6_buckler_config",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        default: 1,
                    },
                    {
                        name: "enabled",
                        type: "boolean",
                        isNullable: false,
                        default: false,
                    },
                    {
                        name: "buckler_id",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "buckler_r_id",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "buckler_praise_date",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "phase",
                        type: "integer",
                        isNullable: true,
                    },
                    {
                        name: "season",
                        type: "integer",
                        isNullable: true,
                    },
                    {
                        name: "discord_webhook_url",
                        type: "varchar",
                        length: "512",
                        isNullable: true,
                    },
                    {
                        name: "phase_start_date",
                        type: "date",
                        isNullable: true,
                    },
                    {
                        name: "updated_at",
                        type: "timestamptz",
                        isNullable: false,
                        default: "NOW()",
                    },
                ],
                checks: [
                    {
                        name: "CHK_sf6_buckler_config_single_row",
                        expression: "id = 1",
                    },
                ],
            }),
        );

        // Seed the single config row with defaults
        await queryRunner.query(
            `INSERT INTO sf6_buckler_config (id) VALUES (1)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("sf6_buckler_config");
    }
}
