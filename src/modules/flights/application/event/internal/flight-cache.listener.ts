import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  FlightEventType,
  FlightLifecycleEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import {
  flightBodyCacheKeys,
  flightDelayCacheKeys,
} from '../../../../../core/cache/cache.key';

@Injectable()
export class FlightCacheListener {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @OnEvent(FlightEventType.FlightWasCreated)
  @OnEvent(FlightEventType.PreliminaryLoadsheetWasUpdated)
  @OnEvent(FlightEventType.ScheduledTimesheetWasUpdated)
  @OnEvent(FlightEventType.PredictedTimesheetWasUpdated)
  @OnEvent(FlightEventType.DepartureParkingPositionWasChanged)
  @OnEvent(FlightEventType.DepartureRunwayWasChanged)
  @OnEvent(FlightEventType.ArrivalParkingPositionWasChanged)
  @OnEvent(FlightEventType.ArrivalRunwayWasChanged)
  @OnEvent(FlightEventType.FlightWasAddedToRotation)
  @OnEvent(FlightEventType.FlightWasRemovedFromRotation)
  @OnEvent(FlightEventType.FlightWasReleased)
  @OnEvent(FlightEventType.PilotCheckedIn)
  @OnEvent(FlightEventType.BoardingWasStarted)
  @OnEvent(FlightEventType.BoardingWasFinished)
  @OnEvent(FlightEventType.OffBlockWasReported)
  @OnEvent(FlightEventType.TakeoffWasReported)
  @OnEvent(FlightEventType.ArrivalWasReported)
  @OnEvent(FlightEventType.OnBlockWasReported)
  @OnEvent(FlightEventType.OffboardingWasStarted)
  @OnEvent(FlightEventType.OffboardingWasFinished)
  @OnEvent(FlightEventType.FlightWasClosed)
  @OnEvent(FlightEventType.EmergencyWasDeclared)
  @OnEvent(FlightEventType.EmergencyWasUpdated)
  @OnEvent(FlightEventType.EmergencyWasResolved)
  @OnEvent(FlightEventType.DiversionWasReported)
  @OnEvent(FlightEventType.DiversionWasUpdated)
  async invalidateFlightBody(event: FlightLifecycleEvent): Promise<void> {
    await this.deleteKeys(flightBodyCacheKeys(event.payload.flightId));
  }

  @OnEvent(FlightEventType.DelayRequestWasCreated)
  @OnEvent(FlightEventType.DelayReportWasFiled)
  @OnEvent(FlightEventType.DelayReportWasAccepted)
  @OnEvent(FlightEventType.DelayReportWasRejected)
  async invalidateDelay(event: FlightLifecycleEvent): Promise<void> {
    await this.deleteKeys(flightDelayCacheKeys(event.payload.flightId));
  }

  private async deleteKeys(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }
}
