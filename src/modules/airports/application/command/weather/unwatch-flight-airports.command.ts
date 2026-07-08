import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AirportWeatherRepository } from '../../../infra/database/airport-weather.repository';

export class UnwatchFlightAirportsCommand {
  constructor(public readonly flightId: string) {}
}

@CommandHandler(UnwatchFlightAirportsCommand)
export class UnwatchFlightAirportsHandler implements ICommandHandler<UnwatchFlightAirportsCommand> {
  constructor(private readonly repository: AirportWeatherRepository) {}

  async execute(command: UnwatchFlightAirportsCommand): Promise<void> {
    await this.repository.unwatchFlightAirports(command.flightId);
  }
}
