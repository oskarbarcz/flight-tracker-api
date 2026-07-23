import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { RotationStatus } from '../../model/rotation.model';
import {
  LegSetFrozenError,
  RotationNotFoundError,
} from '../../model/error/rotation.error';
import { assertLegValid } from '../../model/rotation.rules';
import { AddLegRequest } from '../../infra/http/request/rotation.request';

export class AddLegCommand {
  constructor(
    public readonly rotationId: string,
    public readonly data: AddLegRequest,
    public readonly actorId: string,
  ) {}
}

@CommandHandler(AddLegCommand)
export class AddLegHandler implements ICommandHandler<AddLegCommand> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(command: AddLegCommand): Promise<void> {
    const { rotationId, data } = command;

    const rotation = await this.repository.findById(rotationId);
    if (!rotation) {
      throw new RotationNotFoundError();
    }

    if (rotation.status !== RotationStatus.Draft) {
      throw new LegSetFrozenError();
    }

    assertLegValid(data);

    await this.repository.addLeg(
      rotationId,
      {
        flightNumber: data.flightNumber,
        departureId: data.departureId,
        arrivalId: data.arrivalId,
        offBlockTime: data.offBlockTime,
        onBlockTime: data.onBlockTime,
      },
      command.actorId,
    );
  }
}
