import { FilledSchedule } from '../entity/timesheet.entity';

export function scheduleToBlockTimeInMinutes(schedule: FilledSchedule): number {
  const off = new Date(schedule.offBlockTime).getTime();
  const on = new Date(schedule.onBlockTime).getTime();

  const minutes = (on - off) / (1000 * 60);

  return Math.round(minutes);
}
