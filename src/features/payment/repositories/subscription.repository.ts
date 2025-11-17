import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Subscription } from "../entities/subscription.entity";
import { ProductType } from "../interfaces/productTypes.enum";

export class SubscriptionRepository extends Repository<Subscription> {
    constructor(
        @InjectRepository(Subscription)
        private repository: Repository<Subscription>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async createAndSave(
        subscription: Partial<Subscription>,
    ): Promise<Subscription> {
        const newSubscription = this.repository.create(subscription);
        return await this.save(newSubscription);
    }

    /**
     * Find a specific subscription by user ID and product type
     */
    public async findByStartggUserIdAndProductType(
        startggUserId: string,
        productType: ProductType,
    ): Promise<Subscription> {
        return await this.repository.findOne({
            where: { startggUserId, productType },
        });
    }

    /**
     * Find all subscriptions for a user (across all product types)
     */
    public async findAllByStartggUserId(
        startggUserId: string,
    ): Promise<Subscription[]> {
        return await this.repository.find({
            where: { startggUserId },
        });
    }

    public async findByStripeCustomerId(
        stripeCustomerId: string,
    ): Promise<Subscription> {
        return await this.repository.findOne({
            where: { stripeCustomerId },
        });
    }

    public async findByStripeSubscriptionId(
        stripeSubscriptionId: string,
    ): Promise<Subscription> {
        return await this.repository.findOne({
            where: { stripeSubscriptionId },
        });
    }
}
