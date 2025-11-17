import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateStripeWebhookEventTable1763400000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "stripe_webhook_event",
                columns: [
                    {
                        name: "stripe_webhook_event_id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "stripe_event_id",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "event_type",
                        type: "varchar",
                    },
                    {
                        name: "processed_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true,
        );

        // Create unique index on stripe_event_id for fast idempotency checks
        await queryRunner.createIndex(
            "stripe_webhook_event",
            new TableIndex({
                name: "IDX_stripe_webhook_event_stripe_event_id",
                columnNames: ["stripe_event_id"],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(
            "stripe_webhook_event",
            "IDX_stripe_webhook_event_stripe_event_id",
        );
        await queryRunner.dropTable("stripe_webhook_event");
    }
}
