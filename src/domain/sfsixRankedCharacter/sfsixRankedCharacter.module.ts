import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SFSixRankedCharacterController } from "src/controllers/sfsixRankedCharacter.controller";
import { SFSixRankedCharacter } from "src/domain/entities/sfsixRankedCharacter.entity";
import { SFSixRankedCharacterRepository } from "src/domain/sfsixRankedCharacter/sfsixRankedCharacter.repository";
import { SFSixRankedCharacterService } from "src/domain/sfsixRankedCharacter/sfsixRankedCharacter.service";

@Module({
    imports: [TypeOrmModule.forFeature([SFSixRankedCharacter])],
    providers: [SFSixRankedCharacterService, SFSixRankedCharacterRepository],
    controllers: [SFSixRankedCharacterController],
    exports: [SFSixRankedCharacterService],
})
export class SFSixRankedCharacterModule {}
