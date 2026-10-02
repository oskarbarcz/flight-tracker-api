import {
  ChangeRequestChanges,
  ChangeRequestResource,
  ChangeRequestValues,
} from './change-request.model';
import { FieldOf } from './change-request.diff';

export interface ChangeRequestTarget<R extends ChangeRequestResource> {
  readonly resource: R;
  readonly fields: readonly FieldOf<ChangeRequestValues[R]>[];
  validate(targetId: string, changes: ChangeRequestChanges<R>): Promise<void>;
  read(targetId: string): Promise<ChangeRequestValues[R]>;
  apply(targetId: string, changes: ChangeRequestChanges<R>): Promise<void>;
}

export type ChangeRequestTargetMap = {
  [R in ChangeRequestResource]: ChangeRequestTarget<R>;
};
