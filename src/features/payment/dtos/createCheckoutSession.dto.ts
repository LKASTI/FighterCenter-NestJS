import { IsEnum, IsOptional, IsUrl } from "class-validator";
import { ProductType } from "../interfaces/productTypes.enum";

export class CreateCheckoutSessionDTO {
    @IsUrl()
    successUrl: string;

    @IsUrl()
    cancelUrl: string;

    @IsOptional()
    @IsEnum(ProductType)
    productType?: ProductType;
}
