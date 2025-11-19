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
import { Event } from "@domain/entities/event.entity";
import { EventService } from "../services/event.service";
import { CreateEventDto } from "../dtos/request/create-event.dto";
import { UpdateEventDto } from "../dtos/request/update-event.dto";
import { FindEventsQueryDto } from "../dtos/request/find-events-query.dto";
import {
    ApiEventPost,
    ApiEventGet,
    ApiEventPatch,
    ApiEventDelete
} from "../decorators/event-swagger.decorators";

@Controller("event")
export class EventController {
    constructor(private readonly service: EventService) {}

    @Post()
    @ApiEventPost("Create a new event", Event)
    async create(
        @Body(new ValidationPipe({ transform: true }))
        createEventDto: CreateEventDto,
    ): Promise<Event> {
        return await this.service.create(createEventDto);
    }

    @Get()
    @ApiEventGet("Get all events with optional filters")
    async findAll(
        @Query(new ValidationPipe({ transform: true }))
        query: FindEventsQueryDto,
    ) {
        return await this.service.findAll(query);
    }

    @Get(":id")
    @ApiEventGet("Get an event by ID", Event)
    async findByID(@Param("id", ParseIntPipe) id: number): Promise<Event> {
        const event = await this.service.findById(id);
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }

    @Patch(":id")
    @ApiEventPatch("Update an event by ID", Event, true)
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body(new ValidationPipe({ transform: true }))
        updateEventDto: UpdateEventDto,
    ): Promise<Event> {
        const event = await this.service.update(id, updateEventDto);
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiEventDelete("Delete an event by ID", true)
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        const result = await this.service.remove(id);
        if (!result) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
    }
}
