import { isFlightPreCheckIn } from './rotation.rules';
import { FlightStatus } from '../../flights/model/flight.model';

describe('isFlightPreCheckIn', () => {
  it.each([FlightStatus.Created, FlightStatus.Ready])(
    'accepts a flight that has not checked in yet: %s',
    (status) => {
      expect(isFlightPreCheckIn(status)).toBe(true);
    },
  );

  it.each([
    FlightStatus.CheckedIn,
    FlightStatus.BoardingStarted,
    FlightStatus.BoardingFinished,
    FlightStatus.TaxiingOut,
    FlightStatus.InCruise,
    FlightStatus.TaxiingIn,
    FlightStatus.OnBlock,
    FlightStatus.OffboardingStarted,
    FlightStatus.OffboardingFinished,
    FlightStatus.Closed,
  ])('rejects a flight from check-in onwards: %s', (status) => {
    expect(isFlightPreCheckIn(status)).toBe(false);
  });

  it('covers every flight status exactly once', () => {
    const statuses = Object.values(FlightStatus);
    const accepted = statuses.filter(isFlightPreCheckIn);

    expect(statuses).toHaveLength(12);
    expect(accepted).toEqual([FlightStatus.Created, FlightStatus.Ready]);
  });
});
