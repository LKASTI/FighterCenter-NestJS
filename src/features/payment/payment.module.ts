import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StripeModule } from "@golevelup/nestjs-stripe";
import { Subscription } from "./entities/subscription.entity";
import { StripeWebhookEvent } from "./entities/stripeWebhookEvent.entity";
import { SubscriptionRepository } from "./repositories/subscription.repository";
import { StripeWebhookEventRepository } from "./repositories/stripeWebhookEvent.repository";
import { StripeService } from "./services/stripe.service";
import { SubscriptionService } from "./services/subscription.service";
import { WebhookService } from "./services/webhook.service";
import { SubscriptionController } from "./controllers/subscription.controller";
import { StripeWebhookHandlers } from "./handlers/stripe-webhook.handler";
import { StartggUserModule } from "../../domain/startggUser/startggUser.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Subscription, StripeWebhookEvent]),
        StartggUserModule,
        // Configure StripeModule with webhook support
        StripeModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                apiKey: configService.get<string>("STRIPE_SECRET_KEY"),
                webhookConfig: {
                    stripeSecrets: {
                        account: configService.get<string>("STRIPE_WEBHOOK_SECRET"),
                    },
                },
            }),
        }),
    ],
    providers: [
        SubscriptionRepository,
        StripeWebhookEventRepository,
        StripeService,
        SubscriptionService,
        WebhookService,
        StripeWebhookHandlers,
    ],
    controllers: [SubscriptionController],
    exports: [
        SubscriptionRepository,
        SubscriptionService,
    ],
})
export class PaymentModule {}
