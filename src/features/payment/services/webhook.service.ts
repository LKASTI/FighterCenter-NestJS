import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { StripeWebhookEventRepository } from "../repositories/stripeWebhookEvent.repository";
import { SubscriptionService } from "./subscription.service";
import Stripe from "stripe";

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly stripeWebhookEventRepository: StripeWebhookEventRepository,
        private readonly subscriptionService: SubscriptionService,
    ) {}

    /**
     * Process a Stripe webhook event with idempotency
     * Returns true if successfully processed, false if already processed
     */
    async processEvent(event: Stripe.Event): Promise<boolean> {
        const { id: eventId, type: eventType } = event;

        // Check if event already processed (idempotency)
        const existingEvent = await this.stripeWebhookEventRepository.findByStripeEventId(
            eventId,
        );

        if (existingEvent) {
            this.logger.log(
                `Event ${eventId} (${eventType}) already processed at ${existingEvent.processedAt}`,
            );
            return false;
        }

        // Process event within a transaction
        await this.dataSource.transaction(async (manager) => {
            // Process the event based on type
            this.logger.log(`Processing event ${eventId} (${eventType})`);
            await this.handleEvent(event);

            // Mark event as processed
            await manager.save(
                await this.stripeWebhookEventRepository.create({
                    stripeEventId: eventId,
                    eventType: eventType,
                }),
            );

            this.logger.log(
                `Successfully processed and recorded event ${eventId} (${eventType})`,
            );
        });

        return true;
    }

    /**
     * Handle specific event types
     */
    private async handleEvent(event: Stripe.Event): Promise<void> {
        switch (event.type) {
            case "checkout.session.completed":
                await this.handleCheckoutSessionCompleted(event);
                break;

            case "customer.subscription.created":
            case "customer.subscription.updated":
                await this.handleSubscriptionChange(event);
                break;

            case "customer.subscription.deleted":
                await this.handleSubscriptionDeleted(event);
                break;

            case "invoice.payment_succeeded":
                await this.handlePaymentSucceeded(event);
                break;

            case "invoice.payment_failed":
                await this.handlePaymentFailed(event);
                break;

            default:
                this.logger.warn(`Unhandled event type: ${event.type}`);
        }
    }

    /**
     * Handle checkout.session.completed
     * Links the checkout session to the subscription
     */
    private async handleCheckoutSessionCompleted(
        event: Stripe.Event,
    ): Promise<void> {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription" || !session.subscription) {
            this.logger.warn(
                `Checkout session ${session.id} is not a subscription`,
            );
            return;
        }

        this.logger.log(
            `Checkout completed: session=${session.id}, subscription=${session.subscription}`,
        );

        // The subscription.created event will handle the full update
        // This event just confirms the checkout flow completed
    }

    /**
     * Handle customer.subscription.created and customer.subscription.updated
     * Updates local subscription with Stripe data
     */
    private async handleSubscriptionChange(event: Stripe.Event): Promise<void> {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        await this.subscriptionService.updateFromStripeSubscription(
            stripeSubscription,
        );

        this.logger.log(
            `Subscription ${stripeSubscription.id} updated to status: ${stripeSubscription.status}`,
        );
    }

    /**
     * Handle customer.subscription.deleted
     * Marks subscription as canceled
     */
    private async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        await this.subscriptionService.updateFromStripeSubscription(
            stripeSubscription,
        );

        this.logger.log(
            `Subscription ${stripeSubscription.id} deleted (status: ${stripeSubscription.status})`,
        );
    }

    /**
     * Handle invoice.payment_succeeded
     * Most reliable event for confirming successful payments and renewals
     */
    private async handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
        const invoice = event.data.object as any;

        if (!invoice.subscription) {
            this.logger.warn(
                `Invoice ${invoice.id} is not related to a subscription`,
            );
            return;
        }

        this.logger.log(
            `Payment succeeded for subscription ${invoice.subscription}`,
        );

        // The subscription.updated event will also fire, handling the full update
        // This event confirms the payment processed successfully
    }

    /**
     * Handle invoice.payment_failed
     * Handles failed payments (e.g., expired card, insufficient funds)
     */
    private async handlePaymentFailed(event: Stripe.Event): Promise<void> {
        const invoice = event.data.object as any;

        if (!invoice.subscription) {
            this.logger.warn(
                `Invoice ${invoice.id} is not related to a subscription`,
            );
            return;
        }

        this.logger.log(
            `Payment failed for subscription ${invoice.subscription}`,
        );

        // The subscription will be updated by subscription.updated event to 'past_due'
        // Here you could add additional logic like:
        // - Send email notification to user
        // - Update UI to show payment failure
        // - Temporarily revoke access (depending on your grace period policy)
    }
}
