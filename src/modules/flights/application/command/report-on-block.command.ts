import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightStatus } from '../../model/flight.entity';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToReportOnBlockError,
} from '../../infra/http/request/errors.dto';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../model/event.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Schedule } from '../../model/timesheet.model';

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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ReportOnBlockCommand): Promise<void> {
    const { flightId, initiatorId } = command;
    const query = new GetFlightByIdQuery(flightId);
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

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.OnBlockWasReported,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.OnBlockWasReported, event);
  }
}
