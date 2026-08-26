import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  PreliminaryLoadsheetWasUpdatedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { GetFlightQuery } from '../../../../flights/application/query/get-flight.query';
import { AirportType } from '../../../../airports/model/airport.model';
import { scheduledFlightHours } from '../../../../flights/model/timesheet.model';
import { GenerateFlightManifestCommand } from '../../command/generate-flight-manifest.command';
import { GenerateFlightCargoManifestCommand } from '../../command/generate-flight-cargo-manifest.command';
import { IssueNotocCommand } from '../../command/issue-notoc.command';
import { NotocStageName } from '../../../model/notoc.model';

@Injectable()
export class GenerateManifestsListener {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @OnEvent(FlightEventType.PreliminaryLoadsheetWasUpdated, {
    suppressErrors: false,
  })
  async onPreliminaryLoadsheetWasUpdated(
    event: PreliminaryLoadsheetWasUpdatedEvent,
  ): Promise<void> {
    const flightQuery = new GetFlightQuery(event.payload.flightId);
    const flight = await this.queryBus.execute(flightQuery);
    const loadsheet = flight.loadsheets.preliminary;

    if (!loadsheet) {
      return;
    }

    const generateManifest = new GenerateFlightManifestCommand(
      flight.id,
      flight.aircraft.id,
      flight.operator.id,
      loadsheet.passengers,
      loadsheet.passengersByCabin,
    );
    await this.commandBus.execute(generateManifest);

    const departure = flight.airports.find(
      (airport) => airport.type === AirportType.Departure,
    );
    const arrival = flight.airports.find(
      (airport) => airport.type === AirportType.Destination,
    );

    if (!departure || !arrival) {
      return;
    }

    const generateCargoManifest = new GenerateFlightCargoManifestCommand(
      flight.id,
      flight.aircraft.id,
      flight.operator.iataCode,
      loadsheet.cargo,
      loadsheet.passengers,
      {
        iataCode: departure.iataCode,
        country: departure.country,
        continent: departure.continent,
      },
      {
        iataCode: arrival.iataCode,
        country: arrival.country,
        continent: arrival.continent,
      },
      flight.timesheet.scheduled?.offBlockTime
        ? new Date(flight.timesheet.scheduled.offBlockTime)
        : new Date(),
      scheduledFlightHours(flight.timesheet.scheduled),
      loadsheet.payload,
      loadsheet.passengersByCabin ?? null,
    );
    await this.commandBus.execute(generateCargoManifest);

    const issueNotoc = new IssueNotocCommand(
      flight.id,
      NotocStageName.Preliminary,
      arrival.iataCode,
      new Date(),
    );
    await this.commandBus.execute(issueNotoc);
  }
}
