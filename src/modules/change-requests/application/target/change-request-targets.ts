import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  AirportSummaries,
  ChangeRequestTarget,
  ChangeRequestTargetMap,
} from '../../model/change-request-target';
import {
  AnyChangeRequest,
  ChangeRequest,
  ChangeRequestResource,
} from '../../model/change-request.model';
import { AirportChangeRequestTarget } from './airport-change-request.target';
import { ParkingPositionChangeRequestTarget } from './parking-position-change-request.target';
import { GateChangeRequestTarget } from './gate-change-request.target';
import { TerminalChangeRequestTarget } from './terminal-change-request.target';
import { RunwayChangeRequestTarget } from './runway-change-request.target';
import { memoizedAirportSummaries } from './target-summary';

@Injectable()
export class ChangeRequestTargets {
  private readonly targets: ChangeRequestTargetMap;

  constructor(
    private readonly queryBus: QueryBus,
    airport: AirportChangeRequestTarget,
    parkingPosition: ParkingPositionChangeRequestTarget,
    gate: GateChangeRequestTarget,
    terminal: TerminalChangeRequestTarget,
    runway: RunwayChangeRequestTarget,
  ) {
    this.targets = { airport, parkingPosition, gate, terminal, runway };
  }

  for<R extends ChangeRequestResource>(resource: R): ChangeRequestTarget<R> {
    return this.targets[resource];
  }

  airportSummaries(): AirportSummaries {
    return memoizedAirportSummaries(this.queryBus);
  }

  async describeAll(requests: AnyChangeRequest[]): Promise<ChangeRequest[]> {
    const airports = this.airportSummaries();

    return Promise.all(
      requests.map((request) => this.describe(request, airports)),
    );
  }

  private async describe(
    request: AnyChangeRequest,
    airports: AirportSummaries,
  ): Promise<ChangeRequest> {
    const target = this.for(request.resource);

    return {
      ...request,
      target: await target.describe(request.targetId, airports),
    };
  }
}
