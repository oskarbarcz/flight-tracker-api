import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueryBus } from '@nestjs/cqrs';
import { FlightEventType } from '../../../../../core/events/flight';
import { FlightEventScope } from '../../../model/event.model';
import { NewFlightEvent } from '../../../infra/http/request/event.dto';
import { GetFlightQuery } from '../../query/get-flight.query';
import { DelayRepository } from '../../../infra/database/repository/delay.repository';
import { DELAY_THRESHOLD_SECONDS } from '../../../model/delay.constants';

@Injectable()
export class OffBlockDelayListener {
  private readonly logger = new Logger(OffBlockDelayListener.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly delayRepository: DelayRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(FlightEventType.OffBlockWasReported)
  async onOffBlockWasReported(event: NewFlightEvent): Promise<void> {
    const { flightId } = event;

    const flight = await this.queryBus.execute(new GetFlightQuery(flightId));
    const scheduled = flight.timesheet.scheduled!.offBlockTime!;
    const actual = flight.timesheet.actual!.offBlockTime!;

    const delaySeconds = Math.round(
      (new Date(actual).getTime() - new Date(scheduled).getTime()) / 1000,
    );

    if (delaySeconds < DELAY_THRESHOLD_SECONDS) {
      return;
    }

    const delayMinutes = Math.round(delaySeconds / 60);

    await this.delayRepository.createPending(flightId, delayMinutes);

    const created: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.DelayRequestWasCreated,
      scope: FlightEventScope.System,
      actorId: null,
    };
    this.eventEmitter.emit(FlightEventType.DelayRequestWasCreated, created);

    this.logger.log(
      `Created delay request for flight ${flightId} (${delayMinutes} min late).`,
    );
  }
}
