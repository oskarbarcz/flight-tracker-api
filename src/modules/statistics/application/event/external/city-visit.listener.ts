import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  OnBlockWasReportedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { GetFlightCompletionStatsQuery } from '../../../../flights/application/query/get-flight-completion-stats.query';
import { RecordCityVisitCommand } from '../../command/record-city-visit.command';

@Injectable()
export class CityVisitListener {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @OnEvent(FlightEventType.OnBlockWasReported)
  async onOnBlockWasReported(event: OnBlockWasReportedEvent): Promise<void> {
    const { flightId, landingAirportId } = event.payload;

    const query = new GetFlightCompletionStatsQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight.captainId || !flight.completedAt) {
      return;
    }

    const command = new RecordCityVisitCommand(
      flight.captainId,
      flightId,
      landingAirportId,
      flight.completedAt,
    );
    await this.commandBus.execute(command);
  }
}
