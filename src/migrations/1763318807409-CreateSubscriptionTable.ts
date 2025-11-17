import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateSubscriptionTable1763318807409 implements MigrationInterface {
    name = 'CreateSubscriptionTable1763318807409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create subscription table
        await queryRunner.createTable(
            new Table({
                name: "subscription",
                columns: [
                    {
                        name: "subscription_id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "startgg_user_id",
                        type: "uuid",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "stripe_customer_id",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "stripe_subscription_id",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "stripe_price_id",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "status",
                        type: "varchar",
                        isNullable: false,
                        default: "'none'",
                    },
                    {
                        name: "current_period_start",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "current_period_end",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "cancel_at_period_end",
                        type: "boolean",
                        isNullable: false,
                        default: false,
                    },
                    {
                        name: "canceled_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        isNullable: false,
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        isNullable: false,
                        default: "now()",
                    },
                ],
            }),
            true,
        );

        // Add foreign key constraint to startgg_user
        await queryRunner.createForeignKey(
            "subscription",
            new TableForeignKey({
                name: "FK_subscription_startgg_user",
                columnNames: ["startgg_user_id"],
                referencedTableName: "startgg_user",
                referencedColumnNames: ["startgg_user_id"],
                onDelete: "CASCADE",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.dropForeignKey("subscription", "FK_subscription_startgg_user");

        // Drop subscription table
        await queryRunner.dropTable("subscription");
    }
}
