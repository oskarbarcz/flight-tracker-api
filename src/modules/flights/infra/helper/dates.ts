import { FilledSchedule } from '../../model/timesheet.model';

export function scheduleToBlockTimeInMinutes(schedule: FilledSchedule): number {
  const off = new Date(schedule.offBlockTime).getTime();
  const on = new Date(schedule.onBlockTime).getTime();

  const minutes = (on - off) / (1000 * 60);

  return Math.round(minutes);
}

export function minutesBetween(
  from: Date | null | undefined,
  to: Date | null | undefined,
): number | null {
  if (!from || !to) {
    return null;
  }

  const minutes = (new Date(to).getTime() - new Date(from).getTime()) / 60000;

  return Math.round(minutes);
}
