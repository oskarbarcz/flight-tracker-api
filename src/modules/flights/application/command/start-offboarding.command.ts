import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightStatus } from '../../entity/flight.entity';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToStartOffboardingError,
} from '../../dto/errors.dto';
import { FlightsRepository } from '../../repository/flights.repository';
import { NewFlightEvent } from '../../dto/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../entity/event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class StartOffboardingCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(StartOffboardingCommand)
export class StartOffboardingHandler implements ICommandHandler<StartOffboardingCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: StartOffboardingCommand): Promise<void> {
    const { flightId, initiatorId } = command;
    const query = new GetFlightByIdQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.OnBlock) {
      throw new UnprocessableEntityException(
        InvalidStatusToStartOffboardingError,
      );
    }

    await this.flightsRepository.updateStatus(
      flightId,
      FlightStatus.OffboardingStarted,
    );

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.OffboardingWasStarted,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.OffboardingWasStarted, event);
  }
}
