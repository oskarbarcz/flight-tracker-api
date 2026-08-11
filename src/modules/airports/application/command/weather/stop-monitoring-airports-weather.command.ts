import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../../infra/database/airports.repository';

export class StopMonitoringAirportsWeatherCommand {
  constructor(public readonly airportIds: string[]) {}
}

@CommandHandler(StopMonitoringAirportsWeatherCommand)
export class StopMonitoringAirportsWeatherHandler implements ICommandHandler<StopMonitoringAirportsWeatherCommand> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(command: StopMonitoringAirportsWeatherCommand): Promise<void> {
    await this.repository.stopMonitoring(command.airportIds);
  }
}
