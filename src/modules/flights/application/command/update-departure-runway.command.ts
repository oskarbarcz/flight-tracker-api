import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateDepartureRunwayError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { scopeForActor } from '../../model/event.model';
import { JwtUser } from '../../../auth/infra/http/request/jwt-user.dto';

export class UpdateDepartureRunwayCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly departureRunwayId: string,
  ) {}
}

@CommandHandler(UpdateDepartureRunwayCommand)
export class UpdateDepartureRunwayHandler implements ICommandHandler<UpdateDepartureRunwayCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateDepartureRunwayCommand): Promise<void> {
    const { flightId, actor, departureRunwayId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const preTakeoffStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
      FlightStatus.CheckedIn,
      FlightStatus.BoardingStarted,
      FlightStatus.BoardingFinished,
      FlightStatus.TaxiingOut,
    ];
    if (!preTakeoffStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateDepartureRunwayError();
    }

    await this.flightsRepository.updateDepartureRunway(
      flightId,
      departureRunwayId,
    );

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.DepartureRunwayWasChanged,
      scope: scopeForActor(actor),
      actorId: actor.sub,
    };
    this.eventEmitter.emit(FlightEventType.DepartureRunwayWasChanged, event);
  }
}
