import {
  compareFlightsByTimesheet,
  TimesheetSortedFlight,
} from './flight-list-order';
import { FlightListOrder, FlightListSort } from './flight.model';

function flight(
  id: string,
  times: { offBlock?: string; onBlock?: string | null },
  createdAt = '2025-01-01T00:00:00.000Z',
): TimesheetSortedFlight {
  return {
    id,
    createdAt: new Date(createdAt),
    timesheet: {
      scheduled: { offBlockTime: times.offBlock ?? '2025-01-01T09:00:00.000Z' },
      ...(times.onBlock === undefined
        ? {}
        : { actual: { onBlockTime: times.onBlock } }),
    },
  };
}

function ids(flights: TimesheetSortedFlight[]): string[] {
  return flights.map((entry) => entry.id);
}

describe('compareFlightsByTimesheet', () => {
  const june = flight('june', { offBlock: '2025-06-02T09:00:00.000Z' });
  const january = flight('january', { offBlock: '2025-01-01T13:00:00.000Z' });
  const march = flight('march', { offBlock: '2025-03-05T09:00:00.000Z' });

  it('puts the earliest scheduled off-block first in ascending order', () => {
    const sorted = [june, january, march].sort(
      compareFlightsByTimesheet(
        FlightListSort.ScheduledOffBlockTime,
        FlightListOrder.Ascending,
      ),
    );

    expect(ids(sorted)).toEqual(['january', 'march', 'june']);
  });

  it('puts the latest scheduled off-block first in descending order', () => {
    const sorted = [january, june, march].sort(
      compareFlightsByTimesheet(
        FlightListSort.ScheduledOffBlockTime,
        FlightListOrder.Descending,
      ),
    );

    expect(ids(sorted)).toEqual(['june', 'march', 'january']);
  });

  it('puts the most recent actual on-block first in descending order', () => {
    const early = flight('early', { onBlock: '2025-01-01T16:18:00.000Z' });
    const late = flight('late', { onBlock: '2025-01-03T11:45:00.000Z' });

    const sorted = [early, late].sort(
      compareFlightsByTimesheet(
        FlightListSort.ActualOnBlockTime,
        FlightListOrder.Descending,
      ),
    );

    expect(ids(sorted)).toEqual(['late', 'early']);
  });

  it('puts flights without the sorted time last in either order', () => {
    const arrived = flight('arrived', { onBlock: '2025-01-01T16:18:00.000Z' });
    const pending = flight('pending', {});
    const cleared = flight('cleared', { onBlock: null });

    for (const order of [
      FlightListOrder.Ascending,
      FlightListOrder.Descending,
    ]) {
      const sorted = [pending, cleared, arrived].sort(
        compareFlightsByTimesheet(FlightListSort.ActualOnBlockTime, order),
      );

      expect(sorted[0].id).toBe('arrived');
    }
  });

  it('breaks a tie with the most recently created flight first', () => {
    const older = flight(
      'older',
      { offBlock: '2025-06-02T09:00:00.000Z' },
      '2025-01-01T00:00:00.000Z',
    );
    const newer = flight(
      'newer',
      { offBlock: '2025-06-02T09:00:00.000Z' },
      '2025-02-01T00:00:00.000Z',
    );

    const sorted = [older, newer].sort(
      compareFlightsByTimesheet(
        FlightListSort.ScheduledOffBlockTime,
        FlightListOrder.Ascending,
      ),
    );

    expect(ids(sorted)).toEqual(['newer', 'older']);
  });
});
