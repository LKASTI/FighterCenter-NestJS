import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SFSixRankedProfile } from "@domain/entities/sfsixRankedProfile.entity";
import { SFSixRankedProfileController } from "./controllers/sfsix-ranked-profile.controller";
import { SFSixRankedProfileService } from "./services/sfsix-ranked-profile.service";
import { SFSixRankedProfileRepository } from "./repositories/sfsix-ranked-profile.repository";

@Module({
    imports: [TypeOrmModule.forFeature([SFSixRankedProfile])],
    providers: [SFSixRankedProfileService, SFSixRankedProfileRepository],
    controllers: [SFSixRankedProfileController],
    exports: [SFSixRankedProfileService],
})
export class SFSixRankedProfileModule {}
