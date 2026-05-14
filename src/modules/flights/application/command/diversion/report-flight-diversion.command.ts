import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DiversionRepository } from '../../../infra/database/repository/diversion.repository';
import { ReportDiversionRequest } from '../../../infra/http/request/diversion.dto';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';

export class ReportFlightDiversionCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly payload: ReportDiversionRequest,
  ) {}
}

@CommandHandler(ReportFlightDiversionCommand)
export class ReportFlightDiversionHandler implements ICommandHandler<ReportFlightDiversionCommand> {
  constructor(private readonly diversionRepository: DiversionRepository) {}

  async execute(command: ReportFlightDiversionCommand): Promise<void> {
    await this.diversionRepository.create(
      command.flightId,
      command.actor,
      command.payload,
    );
  }
}
