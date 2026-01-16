import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
import { AircraftService } from '../../../aircraft/service/aircraft.service';
import { OperatorsService } from '../../../operators/service/operators.service';

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
    private readonly aircraftService: AircraftService,
    private readonly operatorsService: OperatorsService,
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

    if (!(await this.aircraftService.exists(flightData.aircraftId))) {
      throw new NotFoundException(AircraftNotFoundError);
    }

    if (!(await this.operatorsService.exists(flightData.operatorId))) {
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
