export type Period = { start: Date; end: Date };

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function currentWeek(now: Date): Period {
  const start = startOfUtcDay(now);
  const mondayOffset = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - mondayOffset);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

export function previousWeek(now: Date): Period {
  const { start } = currentWeek(now);
  const previousStart = new Date(start);
  previousStart.setUTCDate(previousStart.getUTCDate() - 7);
  return { start: previousStart, end: start };
}

export function currentMonth(now: Date): Period {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  return { start, end };
}

export function previousMonth(now: Date): Period {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { start, end };
}

export function currentYear(now: Date): Period {
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
  return { start, end };
}

export function previousYear(now: Date): Period {
  const start = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  return { start, end };
}

export function isWithin(date: Date, period: Period): boolean {
  const time = new Date(date).getTime();
  return time >= period.start.getTime() && time < period.end.getTime();
}

export function utcDayString(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}
