import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AirportWeatherRepository } from '../../../infra/database/airport-weather.repository';

export class WatchAirportsCommand {
  constructor(public readonly airportIds: string[]) {}
}

@CommandHandler(WatchAirportsCommand)
export class WatchAirportsHandler implements ICommandHandler<WatchAirportsCommand> {
  constructor(private readonly repository: AirportWeatherRepository) {}

  async execute(command: WatchAirportsCommand): Promise<void> {
    await this.repository.watchAirports(command.airportIds);
  }
}
