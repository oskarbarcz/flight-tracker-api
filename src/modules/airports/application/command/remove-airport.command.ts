import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../repository/airports.repository';

export class RemoveAirportCommand {
  constructor(public readonly airportId: string) {}
}

@CommandHandler(RemoveAirportCommand)
export class RemoveAirportHandler implements ICommandHandler<RemoveAirportCommand> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(command: RemoveAirportCommand): Promise<void> {
    const { airportId } = command;
    await this.repository.remove(airportId);
  }
}
