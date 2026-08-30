import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { EventsRepository } from '../../../infra/database/repository/events.repository';
import {
  FlightEventResponse,
  toFlightEventResponse,
} from '../../../infra/http/request/event.dto';

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

    return events.map(toFlightEventResponse);
  }
}
