import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEmailToStartggUser1763320000000 implements MigrationInterface {
    name = 'AddEmailToStartggUser1763320000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add email column to startgg_user table
        await queryRunner.addColumn(
            "startgg_user",
            new TableColumn({
                name: "email",
                type: "varchar",
                length: "255",
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop email column
        await queryRunner.dropColumn("startgg_user", "email");
    }
}
