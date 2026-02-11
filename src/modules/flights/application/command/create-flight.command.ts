import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  AircraftNotFoundError,
  DestinationAirportSameAsDepartureAirportError,
  OperatorForAircraftNotFoundError,
} from '../../dto/errors.dto';
import { FlightsRepository } from '../../repository/flights.repository';
import { NewFlightEvent } from '../../dto/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../entity/event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateFlightRequest } from '../../dto/flight.dto';
import { CheckAircraftExistsQuery } from '../../../aircraft/application/query/check-aircraft-exists.query';
import { CheckOperatorExistsQuery } from '../../../operators/application/query/check-operator-exists.query';

export class CreateFlightCommand {
  constructor(
    public readonly flightId: string,
    public readonly flightData: CreateFlightRequest,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(CreateFlightCommand)
export class CreateFlightHandler implements ICommandHandler<CreateFlightCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateFlightCommand): Promise<void> {
    const { flightId, flightData, initiatorId } = command;

    if (flightData.departureAirportId === flightData.destinationAirportId) {
      throw new BadRequestException(
        DestinationAirportSameAsDepartureAirportError,
      );
    }

    const aircraftExists = await this.queryBus.execute(
      new CheckAircraftExistsQuery(flightData.aircraftId),
    );
    if (!aircraftExists) {
      throw new NotFoundException(AircraftNotFoundError);
    }

    const operatorExists = await this.queryBus.execute(
      new CheckOperatorExistsQuery(flightData.operatorId),
    );
    if (!operatorExists) {
      throw new NotFoundException(OperatorForAircraftNotFoundError);
    }

    await this.flightsRepository.create(flightId, flightData);

    const event: NewFlightEvent = {
      flightId: flightId,
      type: FlightEventType.FlightWasCreated,
      scope: FlightEventScope.Operations,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.FlightWasCreated, event);
  }
}
