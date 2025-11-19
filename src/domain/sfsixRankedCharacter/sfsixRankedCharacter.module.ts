import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SFSixRankedCharacter } from "@domain/entities/sfsixRankedCharacter.entity";
import { SFSixRankedCharacterController } from "./controllers/sfsix-ranked-character.controller";
import { SFSixRankedCharacterService } from "./services/sfsix-ranked-character.service";
import { SFSixRankedCharacterRepository } from "./repositories/sfsix-ranked-character.repository";

@Module({
    imports: [TypeOrmModule.forFeature([SFSixRankedCharacter])],
    providers: [SFSixRankedCharacterService, SFSixRankedCharacterRepository],
    controllers: [SFSixRankedCharacterController],
    exports: [SFSixRankedCharacterService],
})
export class SFSixRankedCharacterModule {}
