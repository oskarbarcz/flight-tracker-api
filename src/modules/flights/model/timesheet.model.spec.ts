import { DEFAULT_FLIGHT_HOURS, scheduledFlightHours } from './timesheet.model';

describe('scheduled flight hours', () => {
  it('measures the block time of a complete schedule', () => {
    expect(
      scheduledFlightHours({
        offBlockTime: new Date('2025-06-02T09:00:00Z'),
        onBlockTime: new Date('2025-06-02T17:50:00Z'),
      }),
    ).toBe(8.8);
  });

  it('rounds to a tenth of an hour', () => {
    expect(
      scheduledFlightHours({
        offBlockTime: new Date('2025-06-02T09:00:00Z'),
        onBlockTime: new Date('2025-06-02T10:05:00Z'),
      }),
    ).toBe(1.1);
  });

  it('falls back when the schedule is incomplete', () => {
    expect(scheduledFlightHours(undefined)).toBe(DEFAULT_FLIGHT_HOURS);
    expect(scheduledFlightHours({})).toBe(DEFAULT_FLIGHT_HOURS);
    expect(
      scheduledFlightHours({ offBlockTime: new Date('2025-06-02T09:00:00Z') }),
    ).toBe(DEFAULT_FLIGHT_HOURS);
    expect(
      scheduledFlightHours({ onBlockTime: new Date('2025-06-02T17:50:00Z') }),
    ).toBe(DEFAULT_FLIGHT_HOURS);
  });

  it('falls back when the schedule runs backwards or has no duration', () => {
    expect(
      scheduledFlightHours({
        offBlockTime: new Date('2025-06-02T17:50:00Z'),
        onBlockTime: new Date('2025-06-02T09:00:00Z'),
      }),
    ).toBe(DEFAULT_FLIGHT_HOURS);
    expect(
      scheduledFlightHours({
        offBlockTime: new Date('2025-06-02T09:00:00Z'),
        onBlockTime: new Date('2025-06-02T09:00:00Z'),
      }),
    ).toBe(DEFAULT_FLIGHT_HOURS);
  });
});
