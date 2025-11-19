import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SFSixGamePatch } from "@domain/entities/sfsixGamePatch.entity";
import { SFSixGamePatchController } from "./controllers/sfsix-game-patch.controller";
import { SFSixGamePatchService } from "./services/sfsix-game-patch.service";
import { SFSixGamePatchRepository } from "./repositories/sfsix-game-patch.repository";

@Module({
    imports: [TypeOrmModule.forFeature([SFSixGamePatch])],
    providers: [SFSixGamePatchRepository, SFSixGamePatchService],
    controllers: [SFSixGamePatchController],
    exports: [SFSixGamePatchService]
})
export class SFSixGamePatchModule {}
