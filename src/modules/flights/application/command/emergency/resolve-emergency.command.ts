import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  EmergencyAlreadyResolvedError,
  EmergencyNotFoundError,
} from '../../../model/error/emergency.error';
import { EmergencyRepository } from '../../../infra/database/repository/emergency.repository';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';

export class ResolveEmergencyCommand {
  constructor(
    public readonly flightId: string,
    public readonly emergencyId: string,
    public readonly actor: JwtUser,
  ) {}
}

@CommandHandler(ResolveEmergencyCommand)
export class ResolveEmergencyHandler implements ICommandHandler<ResolveEmergencyCommand> {
  constructor(private readonly emergencyRepository: EmergencyRepository) {}

  async execute(command: ResolveEmergencyCommand): Promise<void> {
    const { flightId, emergencyId, actor } = command;

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

    await this.emergencyRepository.resolve(emergencyId, actor.sub);
  }
}
