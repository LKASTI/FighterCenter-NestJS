import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveIpAddressFromJwtRefreshToken1764191467000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop ip_address column from jwt_refresh_token table
        await queryRunner.dropColumn("jwt_refresh_token", "ip_address");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add ip_address column if migration is reverted
        await queryRunner.addColumn(
            "jwt_refresh_token",
            new TableColumn({
                name: "ip_address",
                type: "varchar",
                length: "45",
                isNullable: true,
            }),
        );
    }
}
