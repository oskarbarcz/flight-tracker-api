import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshWeatherCommand } from '../../application/command/weather/refresh-weather.command';
import { getErrorMessage } from '../../../../core/utils/error-message';

@Injectable()
export class WeatherRefreshService {
  private readonly logger = new Logger(WeatherRefreshService.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async refreshMonitoredAirports(): Promise<void> {
    try {
      const command = new RefreshWeatherCommand();
      await this.commandBus.execute(command);
    } catch (error) {
      this.logger.error(
        `Scheduled weather refresh failed: ${getErrorMessage(error)}`,
      );
    }
  }
}
