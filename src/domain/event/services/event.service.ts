import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Event } from "@domain/entities/event.entity";
import { EventRepository } from "../repositories/event.repository";
import { CreateEventDto } from "../dtos/request/create-event.dto";
import { UpdateEventDto } from "../dtos/request/update-event.dto";
import { FindEventsQueryDto } from "../dtos/request/find-events-query.dto";
import { TaggedCacheService, hashQuery } from "@fgclegends/fightercenter-shared-nestjs";
import { CacheKeys, CacheTags } from "@common/cache/cache-keys.util";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(EventRepository)
        private readonly eventRepository: EventRepository,
        private readonly taggedCacheService: TaggedCacheService,
    ) {}

    public async create(createEventDto: CreateEventDto): Promise<Event> {
        return await this.eventRepository.createAndSave(createEventDto);
    }

    public async findAll(query: FindEventsQueryDto) {
        const queryHash = hashQuery(query);
        const cacheKey = CacheKeys.event.list(queryHash);
        const cached = await this.taggedCacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.eventRepository.findAll(query);

        // Cache for 15 minutes (15 * 60 * 1000 = 900000ms)
        await this.taggedCacheService.setWithTags(
            cacheKey,
            result,
            [CacheTags.event.allLists()],
            900000,
        );

        return result;
    }

    public async findById(id: number): Promise<Event> {
        const cacheKey = CacheKeys.event.byId(id);
        const cached = await this.taggedCacheService.get<Event>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.eventRepository.findOneBy({ eventID: id });

        if (result) {
            // Cache for 15 minutes (15 * 60 * 1000 = 900000ms)
            await this.taggedCacheService.setWithTags(
                cacheKey,
                result,
                [CacheTags.event.byId(id)],
                900000,
            );
        }

        return result;
    }

    public async update(
        id: number,
        updateEventDto: UpdateEventDto,
    ): Promise<Event> {
        const event = await this.eventRepository.findOneBy({ eventID: id });

        if (!event) {
            return null;
        }

        await this.eventRepository.update({ eventID: id }, updateEventDto);
        return await this.eventRepository.findOneBy({ eventID: id });
    }

    public async remove(id: number): Promise<boolean> {
        const result = await this.eventRepository.delete({ eventID: id });
        return result.affected > 0;
    }
}
