import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StripeWebhookEvent } from "../entities/stripeWebhookEvent.entity";

@Injectable()
export class StripeWebhookEventRepository extends Repository<StripeWebhookEvent> {
    constructor(
        @InjectRepository(StripeWebhookEvent)
        private repository: Repository<StripeWebhookEvent>,
    ) {
        super(
            repository.target,
            repository.manager,
            repository.queryRunner,
        );
    }

    /**
     * Find webhook event by Stripe event ID
     */
    public async findByStripeEventId(
        stripeEventId: string,
    ): Promise<StripeWebhookEvent | null> {
        return await this.repository.findOne({
            where: { stripeEventId },
        });
    }

    /**
     * Create and save a new webhook event record
     */
    public async createAndSave(params: {
        stripeEventId: string;
        eventType: string;
    }): Promise<StripeWebhookEvent> {
        const event = this.repository.create({
            stripeEventId: params.stripeEventId,
            eventType: params.eventType,
        });

        return await this.repository.save(event);
    }
}
