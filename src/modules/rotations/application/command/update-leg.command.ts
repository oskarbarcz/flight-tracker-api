import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { Rotation, RotationStatus } from '../../model/rotation.model';
import {
  LegAirportsFrozenError,
  LegLockedError,
  RotationImmutableError,
  RotationLegNotFoundError,
  RotationNotFoundError,
} from '../../model/error/rotation.error';
import {
  assertChainContinuous,
  assertLegValid,
  isFlightPreCheckIn,
  LegShape,
} from '../../model/rotation.rules';
import { UpdateLegRequest } from '../../infra/http/request/rotation.request';
import { RotationLeg } from '../../model/rotation-leg.model';

export class UpdateLegCommand {
  constructor(
    public readonly rotationId: string,
    public readonly legId: string,
    public readonly data: UpdateLegRequest,
    public readonly actorId: string,
  ) {}
}

@CommandHandler(UpdateLegCommand)
export class UpdateLegHandler implements ICommandHandler<UpdateLegCommand> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(command: UpdateLegCommand): Promise<void> {
    const { rotationId, legId, data } = command;

    const rotation = await this.repository.findById(rotationId);
    if (!rotation) {
      throw new RotationNotFoundError();
    }

    const leg = rotation.legs.find((candidate) => candidate.id === legId);
    if (!leg) {
      throw new RotationLegNotFoundError();
    }

    if (rotation.status === RotationStatus.Finished) {
      throw new RotationImmutableError();
    }

    if (this.hasCheckedIn(leg)) {
      throw new LegLockedError();
    }

    const changesAirports =
      (data.departureId !== undefined &&
        data.departureId !== leg.departure.id) ||
      (data.arrivalId !== undefined && data.arrivalId !== leg.arrival.id);

    if (rotation.status !== RotationStatus.Draft && changesAirports) {
      throw new LegAirportsFrozenError();
    }

    const merged: LegShape = {
      departureId: data.departureId ?? leg.departure.id,
      arrivalId: data.arrivalId ?? leg.arrival.id,
      offBlockTime: data.offBlockTime ?? leg.offBlockTime,
      onBlockTime: data.onBlockTime ?? leg.onBlockTime,
    };

    assertLegValid(merged);

    if (rotation.status !== RotationStatus.Draft) {
      this.assertChainStillValid(rotation, legId, merged);
    }

    await this.repository.updateLeg(rotationId, legId, data, command.actorId);
  }

  private hasCheckedIn(leg: RotationLeg): boolean {
    if (!leg.flight) {
      return false;
    }

    return !isFlightPreCheckIn(leg.flight.status);
  }

  private assertChainStillValid(
    rotation: Rotation,
    legId: string,
    merged: LegShape,
  ): void {
    const others = rotation.legs
      .filter((candidate) => candidate.id !== legId)
      .map(
        (candidate): LegShape => ({
          departureId: candidate.departure.id,
          arrivalId: candidate.arrival.id,
          offBlockTime: candidate.offBlockTime,
          onBlockTime: candidate.onBlockTime,
        }),
      );

    assertChainContinuous([...others, merged]);
  }
}
