import { Controller, Post, Req, Headers, Logger, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../services/stripe.service';
import { WebhookService } from '../services/webhook.service';
import Stripe from 'stripe';

@Controller('stripe/webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        private readonly stripeService: StripeService,
        private readonly webhookService: WebhookService,
    ) {}

    @Post()
    async handleWebhook(
        @Req() req: Request,
        @Headers('stripe-signature') signature: string,
    ): Promise<{ received: boolean }> {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        const rawBody = (req as any).rawBody;

        if (!rawBody || !Buffer.isBuffer(rawBody)) {
            throw new BadRequestException('Missing or invalid raw body');
        }

        let event: Stripe.Event;

        try {
            // Verify webhook signature
            event = this.stripeService.constructWebhookEvent(rawBody, signature);
            this.logger.log(`Received verified event: ${event.type} (${event.id})`);
        } catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        // Process the event
        try {
            await this.webhookService.processEvent(event);
            return { received: true };
        } catch (err) {
            this.logger.error(`Webhook processing failed: ${err.message}`, err.stack);
            // Return 200 to acknowledge receipt even if processing fails
            // (prevents Stripe from retrying)
            return { received: true };
        }
    }
}
