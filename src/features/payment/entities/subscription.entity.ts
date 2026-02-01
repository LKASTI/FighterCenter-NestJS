import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    Index,
} from "typeorm";
import { v4 as uuid } from "uuid";
import { ProductType } from "../interfaces/productTypes.enum";

@Entity("subscription")
@Index(["startggUserId", "productType"], { unique: true })
export class Subscription {
    @PrimaryGeneratedColumn("uuid", { name: "subscription_id" })
    subscriptionId: string;

    @BeforeInsert()
    generateIds() {
        this.subscriptionId = uuid();
    }

    @Column("uuid", { name: "startgg_user_id" })
    startggUserId: string;  // Foreign key to user table (managed by auth service)

    @Column("varchar", { name: "product_type", default: ProductType.AD_FREE })
    productType: ProductType;

    @Column("varchar", { name: "stripe_customer_id" })
    stripeCustomerId: string;

    @Column("varchar", { name: "stripe_subscription_id", nullable: true })
    stripeSubscriptionId: string;

    @Column("varchar", { name: "stripe_price_id" })
    stripePriceId: string;

    @Column("varchar", {
        name: "status",
        default: "none",
    })
    status: "active" | "past_due" | "canceled" | "incomplete" | "trialing" | "none";

    @Column("timestamp", { name: "current_period_start", nullable: true })
    currentPeriodStart: Date;

    @Column("timestamp", { name: "current_period_end", nullable: true })
    currentPeriodEnd: Date;

    @Column("boolean", { name: "cancel_at_period_end", default: false })
    cancelAtPeriodEnd: boolean;

    @Column("timestamp", { name: "canceled_at", nullable: true })
    canceledAt: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
