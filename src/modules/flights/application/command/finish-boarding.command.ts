import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightStatus } from '../../entity/flight.entity';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToFinishBoardingError,
} from '../../dto/errors.dto';
import { FlightsRepository } from '../../repository/flights.repository';
import { NewFlightEvent } from '../../dto/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../entity/event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Loadsheet } from '../../entity/loadsheet.entity';

export class FinishBoardingCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly finalLoadsheet: Loadsheet,
  ) {}
}

@CommandHandler(FinishBoardingCommand)
export class FinishBoardingHandler implements ICommandHandler<FinishBoardingCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: FinishBoardingCommand): Promise<void> {
    const { flightId, initiatorId, finalLoadsheet } = command;
    const query = new GetFlightByIdQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.BoardingStarted) {
      throw new UnprocessableEntityException(
        InvalidStatusToFinishBoardingError,
      );
    }

    await Promise.all([
      await this.flightsRepository.updateLoadsheets(flightId, {
        preliminary: flight.loadsheets.preliminary,
        final: finalLoadsheet,
      }),
      await this.flightsRepository.updateStatus(
        flightId,
        FlightStatus.BoardingFinished,
      ),
    ]);

    const event: NewFlightEvent = {
      flightId: flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.BoardingWasFinished,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.BoardingWasFinished, event);
  }
}
