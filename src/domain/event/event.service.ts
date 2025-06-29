import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateEventDTO,
  FindEventsQueryDTO,
  UpdateEventDTO,
} from 'src/dtos/event.dto';
import { Event } from 'src/domain/entities/event.entity';
import { EventRepository } from 'src/domain/event/event.repository';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventRepository)
    private readonly eventRepository: EventRepository,
  ) {}

  public async create(createEventDTO: CreateEventDTO): Promise<Event> {
    return await this.eventRepository.createAndSave(createEventDTO);
  }

  public async findAll(query: FindEventsQueryDTO) {
    return await this.eventRepository.findAll(query);
  }

  public async findById(id: number): Promise<Event> {
    return await this.eventRepository.findOneBy({ eventID: id });
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
