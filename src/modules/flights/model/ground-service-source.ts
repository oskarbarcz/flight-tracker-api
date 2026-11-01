import { GroundServiceSource } from '../../../core/domain/events/dto/flight.events';
import {
  GsxAutomationDisabledError,
  GsxSourceRequiresTransponderError,
} from './error/flight.error';
import { SessionClient } from '../../auth/model/session-client';

export { GroundServiceSource };

export function isRequestedByGsx(
  source: GroundServiceSource | undefined,
  client: SessionClient,
): boolean {
  if (source !== GroundServiceSource.Gsx) {
    return false;
  }

  if (client !== SessionClient.Transponder) {
    throw new GsxSourceRequiresTransponderError();
  }

  return true;
}

export function resolveGroundServiceSource(
  requestedByGsx: boolean,
  automationArmed: boolean,
): GroundServiceSource {
  if (requestedByGsx && !automationArmed) {
    throw new GsxAutomationDisabledError();
  }

  if (requestedByGsx) {
    return GroundServiceSource.Gsx;
  }

  return automationArmed
    ? GroundServiceSource.Override
    : GroundServiceSource.Manual;
}
