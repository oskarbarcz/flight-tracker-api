import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';
import { QueryBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  DelayRequestWasCreatedEvent,
  OffBlockWasReportedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';
import { GetFlightQuery } from '../../query/get-flight.query';
import { DelayRepository } from '../../../infra/database/repository/delay.repository';
import { DELAY_THRESHOLD_SECONDS } from '../../../model/delay.constants';

@Injectable()
export class OffBlockDelayListener {
  private readonly logger = new Logger(OffBlockDelayListener.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly delayRepository: DelayRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  @OnEvent(FlightEventType.OffBlockWasReported)
  async onOffBlockWasReported(event: OffBlockWasReportedEvent): Promise<void> {
    const { flightId } = event.payload;

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

    this.domainEvents.emit(
      new DelayRequestWasCreatedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: FlightEventScope.Operations,
        actorId: null,
      }),
    );

    this.logger.log(
      `Created delay request for flight ${flightId} (${delayMinutes} min late).`,
    );
  }
}
