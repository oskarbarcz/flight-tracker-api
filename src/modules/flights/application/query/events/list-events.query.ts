import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { EventsRepository } from '../../../infra/database/repository/events.repository';
import { FlightEventResponse } from '../../../infra/http/request/event.dto';
import { FlightEventScope } from '../../../model/event.model';
import { FlightEventType } from '../../../../../core/domain/events/dto/flight.events';

export class ListEventsQuery extends Query<FlightEventResponse[]> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(ListEventsQuery)
export class ListEventsHandler implements IQueryHandler<ListEventsQuery> {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(query: ListEventsQuery): Promise<FlightEventResponse[]> {
    const events = await this.eventsRepository.findForFlight(query.flightId);

    return events.map((event) => ({
      ...event,
      scope: event.scope as FlightEventScope,
      type: event.type as FlightEventType,
      payload: event.payload as object,
    }));
  }
}
