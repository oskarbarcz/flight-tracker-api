import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateArrivalRunwayError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../model/event.model';

export class UpdateArrivalRunwayCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly arrivalRunwayId: string,
  ) {}
}

@CommandHandler(UpdateArrivalRunwayCommand)
export class UpdateArrivalRunwayHandler implements ICommandHandler<UpdateArrivalRunwayCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateArrivalRunwayCommand): Promise<void> {
    const { flightId, initiatorId, arrivalRunwayId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const preTaxiInStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
      FlightStatus.CheckedIn,
      FlightStatus.BoardingStarted,
      FlightStatus.BoardingFinished,
      FlightStatus.TaxiingOut,
      FlightStatus.InCruise,
    ];
    if (!preTaxiInStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateArrivalRunwayError();
    }

    await this.flightsRepository.updateArrivalRunway(flightId, arrivalRunwayId);

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.ArrivalRunwayWasChanged,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.ArrivalRunwayWasChanged, event);
  }
}
