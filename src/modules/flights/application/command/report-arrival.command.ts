import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightStatus } from '../../model/flight.entity';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToReportArrivedError,
} from '../../infra/http/request/errors.dto';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../model/event.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Schedule } from '../../model/timesheet.model';

export class ReportArrivalCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(ReportArrivalCommand)
export class ReportArrivalHandler implements ICommandHandler<ReportArrivalCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ReportArrivalCommand): Promise<void> {
    const { flightId, initiatorId } = command;
    const query = new GetFlightByIdQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.InCruise) {
      throw new UnprocessableEntityException(InvalidStatusToReportArrivedError);
    }

    const timesheet = flight.timesheet as { actual: Schedule };
    timesheet.actual.arrivalTime = new Date();

    await this.flightsRepository.updateStatus(flightId, FlightStatus.TaxiingIn);
    await this.flightsRepository.updateTimesheet(flightId, timesheet);

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.ArrivalWasReported,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.ArrivalWasReported, event);
  }
}
