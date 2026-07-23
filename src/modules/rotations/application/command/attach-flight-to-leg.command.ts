import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { RotationStatus } from '../../model/rotation.model';
import {
  FlightAlreadyAttachedError,
  FlightNotAttachableError,
  RotationLegNotFoundError,
  RotationNotActiveError,
  RotationNotFoundError,
} from '../../model/error/rotation.error';
import { GetFlightQuery } from '../../../flights/application/query/get-flight.query';
import { FlightStatus } from '../../../flights/model/flight.model';
import { AirportType } from '../../../airports/model/airport.model';

export class AttachFlightToLegCommand {
  constructor(
    public readonly rotationId: string,
    public readonly legId: string,
    public readonly flightId: string,
    public readonly actorId: string,
  ) {}
}

@CommandHandler(AttachFlightToLegCommand)
export class AttachFlightToLegHandler implements ICommandHandler<AttachFlightToLegCommand> {
  constructor(
    private readonly repository: RotationsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: AttachFlightToLegCommand): Promise<void> {
    const { rotationId, legId, flightId } = command;

    const rotation = await this.repository.findById(rotationId);
    if (!rotation) {
      throw new RotationNotFoundError();
    }

    if (
      rotation.status !== RotationStatus.Ready &&
      rotation.status !== RotationStatus.InProgress
    ) {
      throw new RotationNotActiveError();
    }

    const leg = rotation.legs.find((candidate) => candidate.id === legId);
    if (!leg) {
      throw new RotationLegNotFoundError();
    }

    if (leg.flight) {
      throw new FlightAlreadyAttachedError();
    }

    const flight = await this.queryBus.execute(new GetFlightQuery(flightId));

    if (flight.status !== FlightStatus.Created) {
      throw new FlightNotAttachableError(
        'Only a created flight can be attached to a leg.',
      );
    }

    if (flight.operator.id !== rotation.operatorId) {
      throw new FlightNotAttachableError(
        'Flight operator does not match the rotation operator.',
      );
    }

    const departureId = flight.airports.find(
      (airport) => airport.type === AirportType.Departure,
    )?.id;
    const arrivalId = flight.airports.find(
      (airport) => airport.type === AirportType.Destination,
    )?.id;

    if (departureId !== leg.departure.id || arrivalId !== leg.arrival.id) {
      throw new FlightNotAttachableError(
        'Flight departure and arrival do not match the leg plan.',
      );
    }

    if (flight.flightNumber !== leg.flightNumber) {
      throw new FlightNotAttachableError(
        'Flight number does not match the leg plan.',
      );
    }

    const attachedElsewhere = await this.repository.findLegByFlightId(flightId);
    if (attachedElsewhere) {
      throw new FlightAlreadyAttachedError();
    }

    await this.repository.setLegFlight(
      rotationId,
      legId,
      flightId,
      command.actorId,
    );
  }
}
