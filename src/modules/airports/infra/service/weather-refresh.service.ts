import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshWeatherCommand } from '../../application/command/weather/refresh-weather.command';

@Injectable()
export class WeatherRefreshService {
  constructor(private readonly commandBus: CommandBus) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async refreshWatchedAirports(): Promise<void> {
    const command = new RefreshWeatherCommand();
    await this.commandBus.execute(command);
  }
}
