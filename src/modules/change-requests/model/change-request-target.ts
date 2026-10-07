import {
  ChangeRequestChanges,
  ChangeRequestResource,
  ChangeRequestTargetAirport,
  ChangeRequestTargetSummary,
  ChangeRequestValues,
} from './change-request.model';
import { FieldOf, FieldReferences } from './change-request.diff';

export type AirportSummaries = (
  airportId: string,
) => Promise<ChangeRequestTargetAirport | null>;

export interface ChangeRequestTarget<R extends ChangeRequestResource> {
  readonly resource: R;
  readonly fields: readonly FieldOf<ChangeRequestValues[R]>[];
  readonly references: FieldReferences<ChangeRequestValues[R]>;
  validate(targetId: string, changes: ChangeRequestChanges<R>): Promise<void>;
  read(targetId: string): Promise<ChangeRequestValues[R]>;
  describe(
    targetId: string,
    airports: AirportSummaries,
  ): Promise<ChangeRequestTargetSummary | null>;
  apply(targetId: string, changes: ChangeRequestChanges<R>): Promise<void>;
}

export type ChangeRequestTargetMap = {
  [R in ChangeRequestResource]: ChangeRequestTarget<R>;
};
