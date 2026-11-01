import { GroundServiceSource } from '../../../core/domain/events/dto/flight.events';
import { GsxAutomationDisabledError } from './error/flight.error';

export { GroundServiceSource };

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
