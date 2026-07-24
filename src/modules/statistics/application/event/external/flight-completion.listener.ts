import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  FlightWasClosedEvent,
  OnBlockWasReportedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { GetFlightCompletionStatsQuery } from '../../../../flights/application/query/get-flight-completion-stats.query';
import { RecomputeUserStatisticsCommand } from '../../command/recompute-user-statistics.command';

@Injectable()
export class FlightCompletionListener {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @OnEvent(FlightEventType.OnBlockWasReported)
  async onOnBlockWasReported(event: OnBlockWasReportedEvent): Promise<void> {
    await this.recompute(event.payload.flightId);
  }

  @OnEvent(FlightEventType.FlightWasClosed)
  async onFlightWasClosed(event: FlightWasClosedEvent): Promise<void> {
    await this.recompute(event.payload.flightId);
  }

  private async recompute(flightId: string): Promise<void> {
    const query = new GetFlightCompletionStatsQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight.captainId) {
      return;
    }

    const command = new RecomputeUserStatisticsCommand(flight.captainId);
    await this.commandBus.execute(command);
  }
}
