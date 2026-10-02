import { Injectable } from '@nestjs/common';
import {
  ChangeRequestTarget,
  ChangeRequestTargetMap,
} from '../../model/change-request-target';
import { ChangeRequestResource } from '../../model/change-request.model';
import { AirportChangeRequestTarget } from './airport-change-request.target';

@Injectable()
export class ChangeRequestTargets {
  private readonly targets: ChangeRequestTargetMap;

  constructor(airport: AirportChangeRequestTarget) {
    this.targets = { airport };
  }

  for<R extends ChangeRequestResource>(resource: R): ChangeRequestTarget<R> {
    return this.targets[resource];
  }
}
