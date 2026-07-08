import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CrewRepository } from '../../../infra/database/repository/crew.repository';

export class UnassignCrewMemberFromFlightCommand {
  constructor(
    public readonly flightId: string,
    public readonly crewId: string,
  ) {}
}

@CommandHandler(UnassignCrewMemberFromFlightCommand)
export class UnassignCrewMemberFromFlightHandler implements ICommandHandler<UnassignCrewMemberFromFlightCommand> {
  constructor(private readonly crewRepository: CrewRepository) {}

  async execute(command: UnassignCrewMemberFromFlightCommand): Promise<void> {
    await this.crewRepository.unlinkFromFlight(
      command.flightId,
      command.crewId,
    );
  }
}
