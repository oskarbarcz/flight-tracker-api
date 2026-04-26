import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightDoesNotExistError } from '../../infra/http/request/errors.dto';
import { InvalidStatusToUpdateDepartureRunwayError } from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../model/event.model';

export class UpdateDepartureRunwayCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly departureRunwayId: string | null,
  ) {}
}

@CommandHandler(UpdateDepartureRunwayCommand)
export class UpdateDepartureRunwayHandler implements ICommandHandler<UpdateDepartureRunwayCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateDepartureRunwayCommand): Promise<void> {
    const { flightId, initiatorId, departureRunwayId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
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

    await this.flightsRepository.updateDeparture(flightId, {
      departureRunwayId,
    });

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.DepartureRunwayWasChanged,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.DepartureRunwayWasChanged, event);
  }
}
