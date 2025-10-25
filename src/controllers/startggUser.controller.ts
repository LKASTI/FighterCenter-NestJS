import {
    Body,
    Controller,
    Put,
    Req,
    UseGuards,
    ValidationPipe,
    UnauthorizedException,
    BadRequestException,
} from "@nestjs/common";
import { StartggUserService } from "../domain/startggUser/startggUser.service";
import { BasicStartggAuthGuard } from "../authentication/guards/basicStartggAuth.guard";
import { UpdateSf6CharactersDTO } from "../dtos/updateSf6Characters.dto";
import { StartggUser } from "../domain/entities";
import { SF6_CHARACTERS } from "../common/constants/sf6-characters";

@Controller("startggUser")
export class StartggUserController {
    constructor(private readonly startggUserService: StartggUserService) {}

    @Put("sf6Characters")
    @UseGuards(BasicStartggAuthGuard)
    async updateSf6Characters(
        @Body(new ValidationPipe()) updateSf6CharactersDTO: UpdateSf6CharactersDTO,
        @Req() req: any,
    ): Promise<{ sf6ProfileCharacters: string[] }> {
        const user = req.user as StartggUser;

        if (!user) {
            throw new UnauthorizedException("User not authenticated");
        }

        // Validate that all characters are in the allowed list
        const invalidCharacters = updateSf6CharactersDTO.sf6ProfileCharacters.filter(
            char => !SF6_CHARACTERS.includes(char as any)
        );

        if (invalidCharacters.length > 0) {
            throw new BadRequestException(
                `Invalid characters: ${invalidCharacters.join(', ')}. Must be one of: ${SF6_CHARACTERS.join(', ')}`
            );
        }

        await this.startggUserService.update(
            user.startggUserID,
            { sf6ProfileCharacters: updateSf6CharactersDTO.sf6ProfileCharacters }
        );

        return { sf6ProfileCharacters: updateSf6CharactersDTO.sf6ProfileCharacters };
    }
}
