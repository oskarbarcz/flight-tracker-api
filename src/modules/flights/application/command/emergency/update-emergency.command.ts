import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  EmergencyAlreadyResolvedError,
  EmergencyNotFoundError,
} from '../../../model/error/emergency.error';
import { UpdateEmergencyRequest } from '../../../infra/http/request/emergency.dto';
import { EmergencyRepository } from '../../../infra/database/repository/emergency.repository';

export class UpdateEmergencyCommand {
  constructor(
    public readonly flightId: string,
    public readonly emergencyId: string,
    public readonly payload: UpdateEmergencyRequest,
  ) {}
}

@CommandHandler(UpdateEmergencyCommand)
export class UpdateEmergencyHandler implements ICommandHandler<UpdateEmergencyCommand> {
  constructor(private readonly emergencyRepository: EmergencyRepository) {}

  async execute(command: UpdateEmergencyCommand): Promise<void> {
    const { flightId, emergencyId, payload } = command;

    const existing = await this.emergencyRepository.findById(
      flightId,
      emergencyId,
    );
    if (!existing) {
      throw new EmergencyNotFoundError();
    }
    if (existing.resolvedAt !== null) {
      throw new EmergencyAlreadyResolvedError();
    }

    await this.emergencyRepository.update(emergencyId, payload);
  }
}
