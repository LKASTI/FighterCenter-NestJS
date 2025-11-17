import { ProductType } from "../interfaces/productTypes.enum";

export class SubscriptionStatusDTO {
    subscriptionId: string;
    productType: ProductType;
    status: string;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    hasAccess: boolean;
}
