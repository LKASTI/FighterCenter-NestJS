import { IsEnum, IsOptional, IsUrl } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProductType } from "../interfaces/productTypes.enum";

export class CreateCheckoutSessionDTO {
    @ApiProperty({
        description: "URL to redirect user to after successful payment",
        example: "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
        required: true,
    })
    @IsUrl()
    successUrl: string;

    @ApiProperty({
        description: "URL to redirect user to if they cancel the checkout",
        example: "https://example.com/cancel",
        required: true,
    })
    @IsUrl()
    cancelUrl: string;

    @ApiPropertyOptional({
        description: "Type of subscription product to purchase",
        enum: ProductType,
        default: ProductType.AD_FREE,
        example: ProductType.AD_FREE,
    })
    @IsOptional()
    @IsEnum(ProductType)
    productType?: ProductType;
}
