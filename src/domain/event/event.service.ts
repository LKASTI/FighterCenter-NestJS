import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    CreateEventDTO,
    FindEventsQueryDTO,
    UpdateEventDTO,
} from "src/dtos/event.dto";
import { Event } from "src/domain/entities/event.entity";
import { EventRepository } from "src/domain/event/event.repository";
import { TaggedCacheService } from "../../common/cache/tagged-cache.service";
import { CacheKeys, CacheTags } from "../../common/cache/cache-keys.util";
import { hashQuery } from "../../common/cache/query-hash.util";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(EventRepository)
        private readonly eventRepository: EventRepository,
        private readonly taggedCacheService: TaggedCacheService,
    ) {}

    public async create(createEventDTO: CreateEventDTO): Promise<Event> {
        return await this.eventRepository.createAndSave(createEventDTO);
    }

    public async findAll(query: FindEventsQueryDTO) {
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
        updateEventDTO: UpdateEventDTO,
    ): Promise<Event> {
        const event = await this.eventRepository.findOneBy({ eventID: id });

        if (!event) {
            return null;
        }

        await this.eventRepository.update({ eventID: id }, updateEventDTO);
        return await this.eventRepository.findOneBy({ eventID: id });
    }

    public async remove(id: number): Promise<boolean> {
        const result = await this.eventRepository.delete({ eventID: id });
        return result.affected > 0;
    }
}
