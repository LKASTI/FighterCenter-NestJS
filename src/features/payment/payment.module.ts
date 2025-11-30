import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Subscription } from "./entities/subscription.entity";
import { StripeWebhookEvent } from "./entities/stripeWebhookEvent.entity";
import { SubscriptionRepository } from "./repositories/subscription.repository";
import { StripeWebhookEventRepository } from "./repositories/stripeWebhookEvent.repository";
import { StripeService } from "./services/stripe.service";
import { SubscriptionService } from "./services/subscription.service";
import { WebhookService } from "./services/webhook.service";
import { SubscriptionController } from "./controllers/subscription.controller";
import { WebhookController } from "./controllers/webhook.controller";
import { StartggUserModule } from "../../domain/startggUser/startgg-user.module";
import { AuthModule } from "../../authentication/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Subscription, StripeWebhookEvent]),
        StartggUserModule,
        AuthModule,
    ],
    providers: [
        SubscriptionRepository,
        StripeWebhookEventRepository,
        StripeService,
        SubscriptionService,
        WebhookService,
    ],
    controllers: [SubscriptionController, WebhookController],
    exports: [
        SubscriptionRepository,
        SubscriptionService,
    ],
})
export class PaymentModule {}
