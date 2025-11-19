import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateTwitterShareDto {
    @ApiPropertyOptional({ description: "Twitter share ID (auto-generated if not provided)" })
    @IsOptional()
    @IsString()
    readonly twitterShareId?: string;

    @ApiProperty({ description: "URL of the original page to redirect to", example: "https://fightercenter.com/tier-list/123" })
    @IsOptional()
    @IsString()
    readonly pageUrl?: string;

    @ApiProperty({ description: "URL of the image to display in Twitter card", example: "https://r2.fightercenter.com/tierlist-123.png" })
    @IsOptional()
    @IsString()
    readonly imageUrl?: string;

    @ApiPropertyOptional({ description: "Title for Twitter card", example: "My SF6 Tier List" })
    @IsOptional()
    @IsString()
    readonly title?: string;

    @ApiPropertyOptional({ description: "Description for Twitter card", example: "Check out my Street Fighter 6 tier list!" })
    @IsOptional()
    @IsString()
    readonly description?: string;

    @ApiPropertyOptional({ description: "Creation date" })
    @IsOptional()
    @Type(() => Date)
    createDate?: Date;

    @ApiPropertyOptional({ description: "Update date" })
    @IsOptional()
    @Type(() => Date)
    updateDate?: Date;
}
