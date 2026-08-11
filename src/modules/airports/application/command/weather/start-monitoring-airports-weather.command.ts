import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../../infra/database/airports.repository';
export class StartMonitoringAirportsWeatherCommand {
  constructor(public readonly airportIds: string[]) {}
}

@CommandHandler(StartMonitoringAirportsWeatherCommand)
export class StartMonitoringAirportsWeatherHandler implements ICommandHandler<StartMonitoringAirportsWeatherCommand> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(command: StartMonitoringAirportsWeatherCommand): Promise<void> {
    await this.repository.startMonitoring(command.airportIds);
  }
}
