import { InjectRepository } from "@nestjs/typeorm";
import { Event } from "@domain/entities/event.entity";
import { Repository } from "typeorm";
import { CreateEventDto } from "../dtos/request/create-event.dto";
import { FindEventsQueryDto } from "../dtos/request/find-events-query.dto";

export class EventRepository extends Repository<Event> {
    constructor(
        @InjectRepository(Event)
        private repository: Repository<Event>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async createAndSave(event: CreateEventDto): Promise<Event> {
        try {
            const newEvent = this.repository.create(event);
            const savedEvent = await this.repository.save(newEvent);
            return savedEvent;
        } catch (error) {
            console.log("Error in event createAndSave: ", error);
            throw error;
        }
    }

    public async findAll(query: FindEventsQueryDto) {
        const queryBuilder = this.createQueryBuilder("event");

        // Apply filters if provided
        if (query.eventName) {
            queryBuilder.andWhere("event.eventName = :eventName", {
                eventName: query.eventName,
            });
        }

        if (query.region) {
            queryBuilder.andWhere("event.region = :region", {
                region: query.region,
            });
        }

        if (query.isTournamentSeries) {
            queryBuilder.andWhere(
                "event.isTournamentSeries = :isTournamentSeries",
                {
                    isTournamentSeries: query.isTournamentSeries,
                },
            );
        }

        // All dates provided exist in event.dates array
        if (query.dates) {
            for (const date of query.dates) {
                queryBuilder.andWhere(":date = ANY(event.dates)", {
                    date: date.toISOString(), // date must be converted to string
                });
            }
        }

        // Add sorting
        if (query.sortBy) {
            queryBuilder.orderBy(`event.${query.sortBy}`, query.order);
        }

        // Add limit
        queryBuilder.take(query.limit);

        // Get results and count
        const [events, total] = await queryBuilder.getManyAndCount();

        return {
            data: events,
            meta: {
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }
}
