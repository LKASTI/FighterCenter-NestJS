import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from "typeorm";

/**
 * Tracks processed Stripe webhook events for idempotency
 * Prevents duplicate processing when Stripe retries webhook delivery
 */
@Entity("stripe_webhook_event")
@Index(["stripeEventId"], { unique: true })
export class StripeWebhookEvent {
    @PrimaryGeneratedColumn("uuid", { name: "stripe_webhook_event_id" })
    stripeWebhookEventID: string;

    @Column("varchar", { name: "stripe_event_id", unique: true })
    stripeEventId: string;

    @Column("varchar", { name: "event_type" })
    eventType: string;

    @CreateDateColumn({ name: "processed_at" })
    processedAt: Date;
}
