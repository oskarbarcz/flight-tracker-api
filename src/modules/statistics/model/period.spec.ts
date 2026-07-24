import {
  currentMonth,
  currentWeek,
  currentYear,
  isWithin,
  previousWeek,
  startOfUtcDay,
  utcDayString,
} from './period';

describe('period helpers (UTC, Monday-anchored weeks)', () => {
  it('starts a week on Monday 00:00 UTC', () => {
    // 2025-01-08 is a Wednesday
    const week = currentWeek(new Date('2025-01-08T14:30:00.000Z'));

    expect(week.start.toISOString()).toBe('2025-01-06T00:00:00.000Z');
    expect(week.end.toISOString()).toBe('2025-01-13T00:00:00.000Z');
  });

  it('splits a Sunday and the following Monday into different weeks', () => {
    const now = new Date('2025-01-08T00:00:00.000Z');
    const sunday = new Date('2025-01-05T23:00:00.000Z');
    const monday = new Date('2025-01-06T01:00:00.000Z');

    expect(isWithin(sunday, currentWeek(now))).toBe(false);
    expect(isWithin(sunday, previousWeek(now))).toBe(true);
    expect(isWithin(monday, currentWeek(now))).toBe(true);
  });

  it('bounds a month and a year in UTC', () => {
    const month = currentMonth(new Date('2025-01-15T12:00:00.000Z'));
    expect(month.start.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(month.end.toISOString()).toBe('2025-02-01T00:00:00.000Z');

    const year = currentYear(new Date('2025-06-01T12:00:00.000Z'));
    expect(year.start.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(year.end.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('treats the period start as inclusive and the end as exclusive', () => {
    const month = currentMonth(new Date('2025-01-15T12:00:00.000Z'));

    expect(isWithin(month.start, month)).toBe(true);
    expect(isWithin(month.end, month)).toBe(false);
  });

  it('formats a UTC day key', () => {
    expect(utcDayString(new Date('2025-01-01T16:18:00.000Z'))).toBe(
      '2025-01-01',
    );
    expect(
      startOfUtcDay(new Date('2025-01-01T16:18:00.000Z')).toISOString(),
    ).toBe('2025-01-01T00:00:00.000Z');
  });
});
