import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SFSixGamePatchRepository } from "./sfsixGamePatch.repository";
import { SFSixGamePatchService } from "./sfsixGamePatch.service";
import { SFSixGamePatch } from "../entities/sfsixGamePatch.entity";
import { SFSixGamePatchController } from "../../controllers/sfsixGamePatch.controller";

@Module({
    imports: [TypeOrmModule.forFeature([SFSixGamePatch])],
    providers: [SFSixGamePatchRepository, SFSixGamePatchService],
    controllers: [SFSixGamePatchController],
    exports: [SFSixGamePatchService]
})
export class SFSixGamePatchModule {}