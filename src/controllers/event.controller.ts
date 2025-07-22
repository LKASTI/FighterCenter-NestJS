import {
    Controller,
    Post,
    Body,
    ValidationPipe,
    Get,
    Query,
    Param,
    ParseIntPipe,
    NotFoundException,
    Patch,
    Delete,
    HttpCode,
} from "@nestjs/common";
import {
    CreateEventDTO,
    FindEventsQueryDTO,
    UpdateEventDTO,
} from "src/dtos/event.dto";
import { Event } from "src/domain/entities/event.entity";
import { EventService } from "src/domain/event/event.service";

@Controller("event")
export class EventController {
    constructor(private readonly service: EventService) {}

    @Post()
    async create(
        @Body(new ValidationPipe({ transform: true }))
        createEventDTO: CreateEventDTO,
    ): Promise<Event> {
        return await this.service.create(createEventDTO);
    }

    @Get()
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindEventsQueryDTO,
    ) {
        return await this.service.findAll(query);
    }

    @Get(":id")
    async findByID(@Param("id", ParseIntPipe) id: number): Promise<Event> {
        const event = await this.service.findById(id);
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }

    @Patch(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body(new ValidationPipe({ transform: true }))
        updateEventDto: UpdateEventDTO,
    ): Promise<Event> {
        const event = await this.service.update(id, updateEventDto);
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }

    @Delete(":id")
    @HttpCode(204) // No Content
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);
        if (!result) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
    }
}
