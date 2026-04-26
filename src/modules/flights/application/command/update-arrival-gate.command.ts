import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateArrivalGateError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../model/event.model';

export class UpdateArrivalGateCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly arrivalGateId: string,
  ) {}
}

@CommandHandler(UpdateArrivalGateCommand)
export class UpdateArrivalGateHandler implements ICommandHandler<UpdateArrivalGateCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateArrivalGateCommand): Promise<void> {
    const { flightId, initiatorId, arrivalGateId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const preOnBlockStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
      FlightStatus.CheckedIn,
      FlightStatus.BoardingStarted,
      FlightStatus.BoardingFinished,
      FlightStatus.TaxiingOut,
      FlightStatus.InCruise,
      FlightStatus.TaxiingIn,
    ];
    if (!preOnBlockStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateArrivalGateError();
    }

    await this.flightsRepository.updateArrivalGate(flightId, arrivalGateId);

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.ArrivalGateWasChanged,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.ArrivalGateWasChanged, event);
  }
}
