import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateSFSixRankedCharacterDto {
    @ApiProperty({ description: "Character name", example: "Luke" })
    @IsString()
    @IsNotEmpty()
    readonly characterName: string;

    @ApiProperty({ description: "User code", example: 123456789 })
    @IsNumber()
    @IsNotEmpty()
    readonly usercode: number;
}
