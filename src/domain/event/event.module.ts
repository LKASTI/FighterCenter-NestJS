import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from 'src/controllers/event.controller';
import { Event } from 'src/domain/entities/event.entity';
import { EventRepository } from 'src/domain/event/event.repository';
import { EventService } from 'src/domain/event/event.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [EventService, EventRepository],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
