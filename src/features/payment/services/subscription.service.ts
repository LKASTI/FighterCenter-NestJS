import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import { StripeService } from "./stripe.service";
import { Subscription } from "../entities/subscription.entity";
import { ProductType } from "../interfaces/productTypes.enum";
import {
    AuthClientService,
    AuthUser,
} from "../../../authentication/services/auth-client.service";
import Stripe from "stripe";

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(SubscriptionRepository)
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly stripeService: StripeService,
        private readonly configService: ConfigService,
        private readonly authClientService: AuthClientService,
    ) {}

    /**
     * Create a checkout session for a user to subscribe
     */
    async createCheckoutSession(params: {
        startggUserId: string;
        successUrl: string;
        cancelUrl: string;
        productType?: ProductType;
    }): Promise<{ sessionUrl: string; sessionId: string }> {
        const {
            startggUserId,
            successUrl,
            cancelUrl,
            productType = ProductType.AD_FREE
        } = params;

        // Fetch user to get email (if available)
        const user: AuthUser | null = await this.authClientService.getUserById(startggUserId);

        // Check if user already has this subscription
        let subscription = await this.subscriptionRepository.findByStartggUserIdAndProductType(
            startggUserId,
            productType,
        );

        let stripeCustomerId: string;

        if (subscription) {
            // User already has this subscription record, reuse customer ID
            stripeCustomerId = subscription.stripeCustomerId;
        } else {
            // Check if user has subscriptions for other products (to reuse customer)
            const existingSubscriptions = await this.subscriptionRepository.findAllByStartggUserId(
                startggUserId,
            );

            if (existingSubscriptions.length > 0) {
                // Reuse existing Stripe customer
                stripeCustomerId = existingSubscriptions[0].stripeCustomerId;
            } else {
                // Create a new Stripe customer
                // Only set email if user has one (no synthetic emails for security)
                const customer = await this.stripeService.createCustomer({
                    email: user?.email || undefined,
                    metadata: {
                        startggUserId,
                    },
                });
                stripeCustomerId = customer.id;
            }

            // Create subscription record with 'none' status
            subscription = await this.subscriptionRepository.createAndSave({
                startggUserId,
                stripeCustomerId,
                productType,
                stripePriceId: this.configService.get<string>("STRIPE_PRICE_ID"),
                status: "none",
            });
        }

        // Create Stripe checkout session
        const priceId = this.configService.get<string>("STRIPE_PRICE_ID");
        const session = await this.stripeService.createCheckoutSession({
            customerId: stripeCustomerId,
            priceId,
            successUrl,
            cancelUrl,
            metadata: {
                startggUserId,
                subscriptionId: subscription.subscriptionId,
                productType,
            },
        });

        return {
            sessionUrl: session.url,
            sessionId: session.id,
        };
    }

    /**
     * Get subscription status for a user
     */
    async getSubscriptionStatus(
        startggUserId: string,
        productType: ProductType = ProductType.AD_FREE,
    ): Promise<Subscription | null> {
        return await this.subscriptionRepository.findByStartggUserIdAndProductType(
            startggUserId,
            productType,
        );
    }

    /**
     * Check if user has active subscription access
     */
    async hasAccess(
        startggUserId: string,
        productType: ProductType = ProductType.AD_FREE,
    ): Promise<boolean> {
        const subscription = await this.subscriptionRepository.findByStartggUserIdAndProductType(
            startggUserId,
            productType,
        );

        if (!subscription) {
            return false;
        }

        // User has access if status is active and period hasn't ended
        // Even if cancel_at_period_end is true, they keep access until period end
        return (
            subscription.status === "active" &&
            subscription.currentPeriodEnd &&
            new Date(subscription.currentPeriodEnd) > new Date()
        );
    }

    /**
     * Cancel subscription at period end
     */
    async cancelSubscription(
        startggUserId: string,
        productType: ProductType = ProductType.AD_FREE,
    ): Promise<Subscription> {
        const subscription = await this.subscriptionRepository.findByStartggUserIdAndProductType(
            startggUserId,
            productType,
        );

        if (!subscription) {
            throw new NotFoundException(
                `${productType} subscription not found`,
            );
        }

        if (!subscription.stripeSubscriptionId) {
            throw new NotFoundException(
                `No active ${productType} subscription to cancel`,
            );
        }

        // Cancel at period end in Stripe
        await this.stripeService.cancelSubscription(
            subscription.stripeSubscriptionId,
        );

        // Update local record
        subscription.cancelAtPeriodEnd = true;
        return await this.subscriptionRepository.save(subscription);
    }

    /**
     * Resume a canceled subscription
     */
    async resumeSubscription(
        startggUserId: string,
        productType: ProductType = ProductType.AD_FREE,
    ): Promise<Subscription> {
        const subscription = await this.subscriptionRepository.findByStartggUserIdAndProductType(
            startggUserId,
            productType,
        );

        if (!subscription) {
            throw new NotFoundException(
                `${productType} subscription not found`,
            );
        }

        if (!subscription.stripeSubscriptionId) {
            throw new NotFoundException(
                `No ${productType} subscription to resume`,
            );
        }

        if (!subscription.cancelAtPeriodEnd) {
            // Already active, nothing to do
            return subscription;
        }

        // Resume in Stripe
        await this.stripeService.resumeSubscription(
            subscription.stripeSubscriptionId,
        );

        // Update local record
        subscription.cancelAtPeriodEnd = false;
        return await this.subscriptionRepository.save(subscription);
    }

    /**
     * Update subscription from Stripe event
     */
    async updateFromStripeSubscription(
        stripeSubscription: Stripe.Subscription,
    ): Promise<Subscription> {
        const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            stripeSubscription.id,
        );

        if (!subscription) {
            throw new NotFoundException(
                `Subscription not found for Stripe subscription ${stripeSubscription.id}`,
            );
        }

        // Update subscription details
        subscription.stripeSubscriptionId = stripeSubscription.id;
        subscription.status = stripeSubscription.status as any;
        subscription.currentPeriodStart = new Date(
            (stripeSubscription as any).current_period_start * 1000,
        );
        subscription.currentPeriodEnd = new Date(
            (stripeSubscription as any).current_period_end * 1000,
        );
        subscription.cancelAtPeriodEnd = (stripeSubscription as any).cancel_at_period_end;

        if (stripeSubscription.canceled_at) {
            subscription.canceledAt = new Date(
                stripeSubscription.canceled_at * 1000,
            );
        }

        return await this.subscriptionRepository.save(subscription);
    }
}
