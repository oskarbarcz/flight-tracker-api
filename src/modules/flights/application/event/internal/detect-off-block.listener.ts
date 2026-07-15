import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  FlightPathWasUpdatedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { GetFlightQuery } from '../../query/get-flight.query';
import { FlightStatus } from '../../../model/flight.model';
import { ReportOffBlockCommand } from '../../command/report-off-block.command';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import { firstMovingPosition } from '../../../../../core/utils/ground-speed';

export const OFF_BLOCK_GROUND_SPEED_THRESHOLD_KNOTS = 3;

@Injectable()
export class DetectOffBlockListener {
  private readonly logger = new Logger(DetectOffBlockListener.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly flightsRepository: FlightsRepository,
  ) {}

  @OnEvent(FlightEventType.FlightPathWasUpdated)
  async onFlightPathWasUpdated(
    event: FlightPathWasUpdatedEvent,
  ): Promise<void> {
    const { flightId } = event.payload;

    const flight = await this.queryBus.execute(new GetFlightQuery(flightId));

    if (flight.status !== FlightStatus.BoardingFinished) {
      return;
    }

    const path = await this.flightsRepository.getFlightPath(flightId);
    const firstMoving = firstMovingPosition(
      path,
      OFF_BLOCK_GROUND_SPEED_THRESHOLD_KNOTS,
    );

    if (!firstMoving) {
      return;
    }

    const command = new ReportOffBlockCommand(
      flightId,
      null,
      firstMoving.date,
      true,
    );
    await this.commandBus.execute(command);

    this.logger.log(
      `Automatically reported off-block for flight ${flightId} at ${firstMoving.date.toISOString()}.`,
    );
  }
}
