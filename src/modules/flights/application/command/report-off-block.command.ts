import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightStatus } from '../../entity/flight.entity';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToReportOffBlockError,
} from '../../dto/errors.dto';
import { FlightsRepository } from '../../repository/flights.repository';
import { NewFlightEvent } from '../../dto/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../entity/event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class ReportOffBlockCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(ReportOffBlockCommand)
export class ReportOffBlockHandler implements ICommandHandler<ReportOffBlockCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ReportOffBlockCommand): Promise<void> {
    const { flightId, initiatorId } = command;
    const query = new GetFlightByIdQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.BoardingFinished) {
      throw new UnprocessableEntityException(
        InvalidStatusToReportOffBlockError,
      );
    }

    const timesheet = flight.timesheet;
    timesheet.actual = {
      offBlockTime: new Date(),
      takeoffTime: null,
      arrivalTime: null,
      onBlockTime: null,
    };

    await this.flightsRepository.updateStatus(
      flightId,
      FlightStatus.TaxiingOut,
    );
    await this.flightsRepository.updateTimesheet(flightId, timesheet);

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.OffBlockWasReported,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.OffBlockWasReported, event);
  }
}
