import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateDepartureGateError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../model/event.model';

export class UpdateDepartureGateCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly departureGateId: string,
  ) {}
}

@CommandHandler(UpdateDepartureGateCommand)
export class UpdateDepartureGateHandler implements ICommandHandler<UpdateDepartureGateCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateDepartureGateCommand): Promise<void> {
    const { flightId, initiatorId, departureGateId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const preCheckInStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
    ];
    if (!preCheckInStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateDepartureGateError();
    }

    await this.flightsRepository.updateDepartureGate(flightId, departureGateId);

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.DepartureGateWasChanged,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.DepartureGateWasChanged, event);
  }
}
