import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateArrivalRunwayError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { ArrivalRunwayWasChangedEvent } from '../../../../core/domain/events/dto/flight.events';
import { scopeForActor } from '../../model/event.model';
import { JwtUser } from '../../../auth/infra/http/request/jwt-user.dto';

export class UpdateArrivalRunwayCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly arrivalRunwayId: string,
  ) {}
}

@CommandHandler(UpdateArrivalRunwayCommand)
export class UpdateArrivalRunwayHandler implements ICommandHandler<UpdateArrivalRunwayCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateArrivalRunwayCommand): Promise<void> {
    const { flightId, actor, arrivalRunwayId } = command;

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

    this.domainEvents.emit(
      new ArrivalRunwayWasChangedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
