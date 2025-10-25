import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class UpdateSf6CharactersDTO {
    @IsNotEmpty()
    @Transform(({ value: sf6ProfileCharactersValues }) => {
        if (Array.isArray(sf6ProfileCharactersValues)) {
            return sf6ProfileCharactersValues.map((d) => String(d));
        }
        return [new String(sf6ProfileCharactersValues)];
    })
    @IsArray()
    @IsString({ each: true })
    readonly sf6ProfileCharacters: string[];
}
