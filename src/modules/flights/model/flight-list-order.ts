import { FlightListOrder, FlightListSort } from './flight.model';

export type TimesheetSortedFlight = {
  id: string;
  createdAt: Date;
  timesheet: unknown;
};

export type TimesheetSort = Exclude<FlightListSort, FlightListSort.CreatedAt>;

type StoredSchedule = Record<string, string | null | undefined>;

type StoredTimesheet = {
  scheduled?: StoredSchedule | null;
  actual?: StoredSchedule | null;
};

function eventTime(
  flight: TimesheetSortedFlight,
  sort: TimesheetSort,
): number | null {
  const timesheet = (flight.timesheet ?? {}) as StoredTimesheet;
  const value =
    sort === FlightListSort.ScheduledOffBlockTime
      ? timesheet.scheduled?.offBlockTime
      : timesheet.actual?.onBlockTime;

  if (!value) {
    return null;
  }

  const time = Date.parse(value);

  return Number.isNaN(time) ? null : time;
}

function newestFirst(
  a: TimesheetSortedFlight,
  b: TimesheetSortedFlight,
): number {
  return (
    b.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(b.id)
  );
}

export function compareFlightsByTimesheet(
  sort: TimesheetSort,
  order: FlightListOrder,
): (a: TimesheetSortedFlight, b: TimesheetSortedFlight) => number {
  const direction = order === FlightListOrder.Ascending ? 1 : -1;

  return (a, b) => {
    const timeA = eventTime(a, sort);
    const timeB = eventTime(b, sort);

    if (timeA === null || timeB === null) {
      if (timeA === timeB) {
        return newestFirst(a, b);
      }

      return timeA === null ? 1 : -1;
    }

    return (timeA - timeB) * direction || newestFirst(a, b);
  };
}
