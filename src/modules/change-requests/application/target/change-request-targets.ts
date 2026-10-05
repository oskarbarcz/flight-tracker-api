import { Injectable } from '@nestjs/common';
import {
  ChangeRequestTarget,
  ChangeRequestTargetMap,
} from '../../model/change-request-target';
import { ChangeRequestResource } from '../../model/change-request.model';
import { AirportChangeRequestTarget } from './airport-change-request.target';
import { ParkingPositionChangeRequestTarget } from './parking-position-change-request.target';
import { GateChangeRequestTarget } from './gate-change-request.target';
import { TerminalChangeRequestTarget } from './terminal-change-request.target';
import { RunwayChangeRequestTarget } from './runway-change-request.target';

@Injectable()
export class ChangeRequestTargets {
  private readonly targets: ChangeRequestTargetMap;

  constructor(
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
}
