import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    ValidationPipe,
    UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubscriptionService } from "../services/subscription.service";
import { CreateCheckoutSessionDTO } from "../dtos/createCheckoutSession.dto";
import { SubscriptionStatusDTO } from "../dtos/subscriptionStatus.dto";
import { ProductType } from "../interfaces/productTypes.enum";
import {
    ApiSubscriptionPost,
    ApiSubscriptionGet,
    ApiSubscriptionPostWithQuery,
} from "../decorators/subscription-swagger.decorators";

@Controller("subscription")
@ApiTags("Subscription")
export class SubscriptionController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
    ) {}

    /**
     * Create a Stripe checkout session for subscription
     */
    @Post("checkout")
    @ApiSubscriptionPost("Create Stripe checkout session for subscription")
    async createCheckoutSession(
        @Body(new ValidationPipe()) dto: CreateCheckoutSessionDTO,
        @Req() req: any,
    ): Promise<{ sessionUrl: string; sessionId: string }> {
        const user = req.user as any;

        if (!user) {
            throw new UnauthorizedException("User not authenticated");
        }

        return await this.subscriptionService.createCheckoutSession({
            startggUserId: user.startggUserID,
            successUrl: dto.successUrl,
            cancelUrl: dto.cancelUrl,
            productType: dto.productType,
        });
    }

    /**
     * Get subscription status for the authenticated user
     */
    @Get("status")
    @ApiSubscriptionGet("Get subscription status for authenticated user", SubscriptionStatusDTO)
    async getSubscriptionStatus(
        @Req() req: any,
        @Query("productType") productType?: ProductType,
    ): Promise<SubscriptionStatusDTO | { hasAccess: false }> {
        const user = req.user as any;

        if (!user) {
            throw new UnauthorizedException("User not authenticated");
        }

        const subscription = await this.subscriptionService.getSubscriptionStatus(
            user.startggUserID,
            productType,
        );

        if (!subscription) {
            return { hasAccess: false };
        }

        const hasAccess = await this.subscriptionService.hasAccess(
            user.startggUserID,
            productType,
        );

        return {
            subscriptionId: subscription.subscriptionId,
            productType: subscription.productType,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            hasAccess,
        };
    }

    /**
     * Check if user has access to a feature
     */
    @Get("has-access")
    @ApiSubscriptionGet("Check if user has active subscription access")
    async hasAccess(
        @Req() req: any,
        @Query("productType") productType?: ProductType,
    ): Promise<{ hasAccess: boolean }> {
        const user = req.user as any;

        if (!user) {
            throw new UnauthorizedException("User not authenticated");
        }

        const hasAccess = await this.subscriptionService.hasAccess(
            user.startggUserID,
            productType,
        );

        return { hasAccess };
    }

    /**
     * Cancel subscription (at period end)
     */
    @Post("cancel")
    @ApiSubscriptionPostWithQuery("Cancel subscription at end of current billing period", SubscriptionStatusDTO)
    async cancelSubscription(
        @Req() req: any,
        @Query("productType") productType?: ProductType,
    ): Promise<SubscriptionStatusDTO> {
        const user = req.user as any;

        if (!user) {
            throw new UnauthorizedException("User not authenticated");
        }

        const subscription = await this.subscriptionService.cancelSubscription(
            user.startggUserID,
            productType,
        );

        const hasAccess = await this.subscriptionService.hasAccess(
            user.startggUserID,
            productType,
        );

        return {
            subscriptionId: subscription.subscriptionId,
            productType: subscription.productType,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            hasAccess,
        };
    }

    /**
     * Resume a canceled subscription
     */
    @Post("resume")
    @ApiSubscriptionPostWithQuery("Resume a previously canceled subscription", SubscriptionStatusDTO)
    async resumeSubscription(
        @Req() req: any,
        @Query("productType") productType?: ProductType,
    ): Promise<SubscriptionStatusDTO> {
        const user = req.user as any;

        if (!user) {
            throw new UnauthorizedException("User not authenticated");
        }

        const subscription = await this.subscriptionService.resumeSubscription(
            user.startggUserID,
            productType,
        );

        const hasAccess = await this.subscriptionService.hasAccess(
            user.startggUserID,
            productType,
        );

        return {
            subscriptionId: subscription.subscriptionId,
            productType: subscription.productType,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            hasAccess,
        };
    }
}
