import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RunwaysRepository } from '../../infra/database/runways.repository';
import { RunwayNotAtAirportError } from '../../model/error/runway.error';

export class AssertRunwayBelongsToAirportCommand {
  constructor(
    public readonly airportId: string,
    public readonly runwayId: string,
  ) {}
}

@CommandHandler(AssertRunwayBelongsToAirportCommand)
export class AssertRunwayBelongsToAirportHandler implements ICommandHandler<AssertRunwayBelongsToAirportCommand> {
  constructor(private readonly runwaysRepository: RunwaysRepository) {}

  async execute(command: AssertRunwayBelongsToAirportCommand): Promise<void> {
    const { airportId, runwayId } = command;
    if (!(await this.runwaysRepository.exists(airportId, runwayId))) {
      throw new RunwayNotAtAirportError();
    }
  }
}
