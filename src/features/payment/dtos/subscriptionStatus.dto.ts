import { ApiProperty } from "@nestjs/swagger";
import { ProductType } from "../interfaces/productTypes.enum";

export class SubscriptionStatusDTO {
    @ApiProperty({
        description: "Unique identifier for the subscription",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    subscriptionId: string;

    @ApiProperty({
        description: "Type of subscription product",
        enum: ProductType,
        example: ProductType.AD_FREE,
    })
    productType: ProductType;

    @ApiProperty({
        description: "Current subscription status in Stripe",
        enum: ["active", "past_due", "canceled", "incomplete", "trialing", "none"],
        example: "active",
    })
    status: string;

    @ApiProperty({
        description: "Start date of the current billing period",
        type: "string",
        format: "date-time",
        example: "2025-01-01T00:00:00.000Z",
        nullable: true,
    })
    currentPeriodStart: Date | null;

    @ApiProperty({
        description: "End date of the current billing period",
        type: "string",
        format: "date-time",
        example: "2025-02-01T00:00:00.000Z",
        nullable: true,
    })
    currentPeriodEnd: Date | null;

    @ApiProperty({
        description: "Whether the subscription will cancel at the end of the current period",
        example: false,
    })
    cancelAtPeriodEnd: boolean;

    @ApiProperty({
        description: "Whether the user currently has access to the subscription benefits",
        example: true,
    })
    hasAccess: boolean;
}
