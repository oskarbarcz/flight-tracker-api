import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightStatus } from '../../entity/flight.entity';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateLoadsheetError,
} from '../../dto/errors.dto';
import { FlightsRepository } from '../../repository/flights.repository';
import { Loadsheet, Loadsheets } from '../../entity/loadsheet.entity';
import { NewFlightEvent } from '../../dto/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../entity/event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class UpdatePreliminaryLoadsheetCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly loadsheet: Loadsheet,
  ) {}
}

@CommandHandler(UpdatePreliminaryLoadsheetCommand)
export class UpdatePreliminaryLoadsheetHandler implements ICommandHandler<UpdatePreliminaryLoadsheetCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdatePreliminaryLoadsheetCommand): Promise<void> {
    const { flightId, initiatorId, loadsheet } = command;
    const query = new GetFlightByIdQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Created) {
      throw new UnprocessableEntityException(
        InvalidStatusToUpdateLoadsheetError,
      );
    }

    const loadsheets: Loadsheets = { preliminary: loadsheet, final: null };
    await this.flightsRepository.updateLoadsheets(flightId, loadsheets);
    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.PreliminaryLoadsheetWasUpdated,
      scope: FlightEventScope.Operations,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(
      FlightEventType.PreliminaryLoadsheetWasUpdated,
      event,
    );
  }
}
