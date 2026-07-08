import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  OnBlockWasReportedEvent,
  PilotCheckedInEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { WatchAirportsCommand } from '../../command/weather/watch-airports.command';
import { UnwatchFlightAirportsCommand } from '../../command/weather/unwatch-flight-airports.command';
import { RefreshWeatherCommand } from '../../command/weather/refresh-weather.command';

@Injectable()
export class WeatherFlightLifecycleListener {
  private readonly logger = new Logger(WeatherFlightLifecycleListener.name);

  constructor(private readonly commandBus: CommandBus) {}

  @OnEvent(FlightEventType.PilotCheckedIn)
  async onPilotCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    const { flightId, airportIds } = event.payload;

    const watchCommand = new WatchAirportsCommand(airportIds);
    await this.commandBus.execute(watchCommand);

    try {
      const refreshCommand = new RefreshWeatherCommand(airportIds);
      await this.commandBus.execute(refreshCommand);
    } catch (error) {
      this.logger.warn(
        `Could not fetch weather at check-in for flight ${flightId}: ${error}`,
      );
    }
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  async onOnBlockWasReported(event: OnBlockWasReportedEvent): Promise<void> {
    const command = new UnwatchFlightAirportsCommand(event.payload.flightId);
    await this.commandBus.execute(command);
  }
}
