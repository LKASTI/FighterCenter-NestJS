import { Injectable, Logger } from "@nestjs/common";
import { StripeWebhookHandler } from "@golevelup/nestjs-stripe";
import { WebhookService } from "../services/webhook.service";
import Stripe from "stripe";

/**
 * Stripe webhook event handlers using @golevelup/nestjs-stripe
 * Each handler is automatically registered and signature-verified
 */
@Injectable()
export class StripeWebhookHandlers {
    private readonly logger = new Logger(StripeWebhookHandlers.name);

    constructor(private readonly webhookService: WebhookService) {}

    /**
     * Handle checkout session completion
     * Fired when user completes payment in Stripe checkout
     */
    @StripeWebhookHandler("checkout.session.completed")
    async handleCheckoutSessionCompleted(evt: Stripe.Event) {
        this.logger.log(`Received: checkout.session.completed (${evt.id})`);
        await this.webhookService.processEvent(evt);
    }

    /**
     * Handle new subscription creation
     * Fired when Stripe creates a new subscription
     */
    @StripeWebhookHandler("customer.subscription.created")
    async handleSubscriptionCreated(evt: Stripe.Event) {
        this.logger.log(`Received: customer.subscription.created (${evt.id})`);
        await this.webhookService.processEvent(evt);
    }

    /**
     * Handle subscription updates
     * Fired when subscription status, period, or settings change
     */
    @StripeWebhookHandler("customer.subscription.updated")
    async handleSubscriptionUpdated(evt: Stripe.Event) {
        this.logger.log(`Received: customer.subscription.updated (${evt.id})`);
        await this.webhookService.processEvent(evt);
    }

    /**
     * Handle subscription deletion
     * Fired when subscription ends (after the paid period expires)
     */
    @StripeWebhookHandler("customer.subscription.deleted")
    async handleSubscriptionDeleted(evt: Stripe.Event) {
        this.logger.log(`Received: customer.subscription.deleted (${evt.id})`);
        await this.webhookService.processEvent(evt);
    }

    /**
     * Handle successful payment
     * Most reliable event for confirming successful payments and renewals
     */
    @StripeWebhookHandler("invoice.payment_succeeded")
    async handlePaymentSucceeded(evt: Stripe.Event) {
        this.logger.log(`Received: invoice.payment_succeeded (${evt.id})`);
        await this.webhookService.processEvent(evt);
    }

    /**
     * Handle failed payment
     * Fired when payment fails (expired card, insufficient funds, etc.)
     */
    @StripeWebhookHandler("invoice.payment_failed")
    async handlePaymentFailed(evt: Stripe.Event) {
        this.logger.log(`Received: invoice.payment_failed (${evt.id})`);
        await this.webhookService.processEvent(evt);
    }
}
