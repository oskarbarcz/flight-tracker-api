import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  FlightPathWasUpdatedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { GetFlightQuery } from '../../query/get-flight.query';
import { FlightStatus } from '../../../model/flight.model';
import { AirportType } from '../../../../airports/model/airport.model';
import { ReportArrivalCommand } from '../../command/report-arrival.command';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import { firstArrivalPosition } from '../../../../../core/utils/arrival-position';

export const ARRIVAL_GROUND_SPEED_THRESHOLD_KNOTS = 50;

@Injectable()
export class DetectArrivalListener {
  private readonly logger = new Logger(DetectArrivalListener.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly flightsRepository: FlightsRepository,
  ) {}

  @OnEvent(FlightEventType.FlightPathWasUpdated)
  async onFlightPathWasUpdated(
    event: FlightPathWasUpdatedEvent,
  ): Promise<void> {
    const { flightId } = event.payload;

    const flight = await this.queryBus.execute(new GetFlightQuery(flightId));

    if (flight.status !== FlightStatus.InCruise) {
      return;
    }

    const destination = flight.airports.find(
      (airport) => airport.type === AirportType.Destination,
    );

    if (!destination?.shape) {
      return;
    }

    const path = await this.flightsRepository.getFlightPath(flightId);
    const firstArrival = firstArrivalPosition(
      path,
      destination.shape,
      ARRIVAL_GROUND_SPEED_THRESHOLD_KNOTS,
    );

    if (!firstArrival) {
      return;
    }

    const command = new ReportArrivalCommand(
      flightId,
      null,
      firstArrival.date,
      true,
    );
    await this.commandBus.execute(command);

    this.logger.log(
      `Automatically reported arrival for flight ${flightId} at ${firstArrival.date.toISOString()}.`,
    );
  }
}
