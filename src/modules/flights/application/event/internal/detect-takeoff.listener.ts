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
import { ReportTakeoffCommand } from '../../command/report-takeoff.command';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import { firstPositionOutsidePerimeter } from '../../../../../core/utils/perimeter';

@Injectable()
export class DetectTakeoffListener {
  private readonly logger = new Logger(DetectTakeoffListener.name);

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

    if (flight.status !== FlightStatus.TaxiingOut) {
      return;
    }

    const departure = flight.airports.find(
      (airport) => airport.type === AirportType.Departure,
    );

    if (!departure?.shape) {
      return;
    }

    const path = await this.flightsRepository.getFlightPath(flightId);
    const firstOutside = firstPositionOutsidePerimeter(path, departure.shape);

    if (!firstOutside) {
      return;
    }

    const command = new ReportTakeoffCommand(
      flightId,
      null,
      firstOutside.date,
      true,
    );
    await this.commandBus.execute(command);

    this.logger.log(
      `Automatically reported takeoff for flight ${flightId} at ${firstOutside.date.toISOString()}.`,
    );
  }
}
