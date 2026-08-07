import { CreateFlightFromSimbriefHandler } from './create-flight-from-simbrief.command';
import { FlightServiceType } from '../../model/flight.model';
import { OperationalFlightPlan } from '../../../../core/provider/simbrief/type/simbrief.types';

function ofpWithPaxCount(paxCount?: string): OperationalFlightPlan {
  return { weights: { pax_count: paxCount } } as OperationalFlightPlan;
}

describe('CreateFlightFromSimbriefHandler service type derivation', () => {
  let handler: CreateFlightFromSimbriefHandler;

  function derive(paxCount?: string): FlightServiceType {
    return (
      handler as unknown as {
        deriveServiceType: (ofp: OperationalFlightPlan) => FlightServiceType;
      }
    ).deriveServiceType(ofpWithPaxCount(paxCount));
  }

  beforeEach(() => {
    handler = new CreateFlightFromSimbriefHandler(
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
    );
  });

  it('derives a cargo service when the plan reports no passengers', () => {
    expect(derive('0')).toBe(FlightServiceType.Cargo);
  });

  it('derives a passenger service when the plan reports passengers', () => {
    expect(derive('348')).toBe(FlightServiceType.Passenger);
  });

  it('derives a passenger service when the plan omits the passenger count', () => {
    expect(derive(undefined)).toBe(FlightServiceType.Passenger);
  });

  it('derives a passenger service when the reported count is blank', () => {
    expect(derive('   ')).toBe(FlightServiceType.Passenger);
  });

  it('derives a passenger service when the reported count is not a number', () => {
    expect(derive('n/a')).toBe(FlightServiceType.Passenger);
  });
});
