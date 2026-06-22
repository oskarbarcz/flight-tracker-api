import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToReportOnBlockError,
} from '../../infra/http/request/errors.dto';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { DiversionRepository } from '../../infra/database/repository/diversion.repository';
import { OnBlockWasReportedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { Schedule } from '../../model/timesheet.model';
import { AirportType } from '../../../airports/model/airport.model';

export class ReportOnBlockCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(ReportOnBlockCommand)
export class ReportOnBlockHandler implements ICommandHandler<ReportOnBlockCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly diversionRepository: DiversionRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: ReportOnBlockCommand): Promise<void> {
    const { flightId, initiatorId } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.TaxiingIn) {
      throw new UnprocessableEntityException(InvalidStatusToReportOnBlockError);
    }

    const timesheet = flight.timesheet as { actual: Schedule };
    timesheet.actual.onBlockTime = new Date();

    await this.flightsRepository.updateStatus(flightId, FlightStatus.OnBlock);
    await this.flightsRepository.updateTimesheet(flightId, timesheet);

    const landingAirportId = flight.isFlightDiverted
      ? (await this.diversionRepository.get(flightId)).airport.id
      : flight.airports.find(
          (airport) => airport.type === AirportType.Destination,
        )!.id;

    this.domainEvents.emit(
      new OnBlockWasReportedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
        aircraftId: flight.aircraft.id,
        landingAirportId,
      }),
    );
  }
}
