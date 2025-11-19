import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "@domain/entities/event.entity";
import { EventController } from "./controllers/event.controller";
import { EventService } from "./services/event.service";
import { EventRepository } from "./repositories/event.repository";
import { CommonModule } from "@common/common.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Event]),
        CommonModule
    ],
    providers: [EventService, EventRepository],
    controllers: [EventController],
    exports: [EventService, EventRepository],
})
export class EventModule {}
