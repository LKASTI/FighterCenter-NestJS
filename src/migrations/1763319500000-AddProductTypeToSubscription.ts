import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class AddProductTypeToSubscription1763319500000 implements MigrationInterface {
    name = 'AddProductTypeToSubscription1763319500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add product_type column
        await queryRunner.addColumn(
            "subscription",
            new TableColumn({
                name: "product_type",
                type: "varchar",
                default: "'ad_free'",
                isNullable: false,
            }),
        );

        // Drop the old unique constraint on startgg_user_id
        await queryRunner.query(
            `ALTER TABLE "subscription" DROP CONSTRAINT "UQ_77f2cfe20a5dc164cfd4adfdaa5"`,
        );

        // Create composite unique index on (startgg_user_id, product_type)
        await queryRunner.createIndex(
            "subscription",
            new TableIndex({
                name: "IDX_subscription_user_product",
                columnNames: ["startgg_user_id", "product_type"],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop composite unique index
        await queryRunner.dropIndex("subscription", "IDX_subscription_user_product");

        // Restore old unique constraint on startgg_user_id
        await queryRunner.query(
            `ALTER TABLE "subscription" ADD CONSTRAINT "UQ_77f2cfe20a5dc164cfd4adfdaa5" UNIQUE ("startgg_user_id")`,
        );

        // Drop product_type column
        await queryRunner.dropColumn("subscription", "product_type");
    }
}
