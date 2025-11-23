import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private readonly configService: ConfigService) {
        this.stripe = new Stripe(
            this.configService.get<string>("STRIPE_SECRET_KEY"),
        );
    }

    /**
     * Create a Stripe customer
     */
    async createCustomer(params: {
        email: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Customer> {
        return await this.stripe.customers.create({
            email: params.email,
            metadata: params.metadata || {},
        });
    }

    /**
     * Create a checkout session for subscription
     */
    async createCheckoutSession(params: {
        customerId: string;
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Checkout.Session> {
        return await this.stripe.checkout.sessions.create({
            customer: params.customerId,
            line_items: [
                {
                    price: params.priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata || {},
        });
    }

    /**
     * Get a subscription by ID
     */
    async getSubscription(
        subscriptionId: string,
    ): Promise<Stripe.Subscription> {
        return await this.stripe.subscriptions.retrieve(subscriptionId);
    }

    /**
     * Cancel a subscription at period end
     */
    async cancelSubscription(
        subscriptionId: string,
    ): Promise<Stripe.Subscription> {
        return await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    }

    /**
     * Resume a canceled subscription (remove cancel_at_period_end)
     */
    async resumeSubscription(
        subscriptionId: string,
    ): Promise<Stripe.Subscription> {
        return await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
        });
    }

    /**
     * Construct webhook event from raw body and signature
     */
    constructWebhookEvent(
        rawBody: Buffer,
        signature: string,
    ): Stripe.Event {
        const webhookSecret = this.configService.get<string>(
            "STRIPE_WEBHOOK_SECRET",
        );
        return this.stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret,
        );
    }

    /**
     * Get Stripe instance for advanced use cases
     */
    getStripeInstance(): Stripe {
        return this.stripe;
    }
}
