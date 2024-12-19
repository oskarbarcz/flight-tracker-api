import expect from 'expect';
import { validate as isUuid } from 'uuid';

export const deepCompare = (actual: any, expected: any) => {
  if (expected === '@uuid') {
    expect(isUuid(actual)).toBe(true);

    return;
  }

  if (expected === "@date('within 1 minute from now')") {
    const actualDate = new Date(actual);
    const now = new Date();
    // not in the future
    expect(actualDate.getTime()).toBeLessThan(now.getTime());
    // no more in past than 1 minute
    const diff = Math.abs(actualDate.getTime() - now.getTime());
    expect(diff).toBeLessThan(60 * 1000);

    return;
  }

  if (actual === expected) return;

  if (typeof actual !== 'object' || actual === null || expected === null) {
    expect(actual).toBe(expected);
    return;
  }

  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);

  expect(actualKeys.length).toBe(expectedKeys.length);

  for (const key of expectedKeys) {
    expect(actualKeys).toContain(key);
    deepCompare(actual[key], expected[key]);
  }
};