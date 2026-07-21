import expect from 'expect';
import { validate as isUuid } from 'uuid';

export const deepCompare = (actual: any, expected: any) => {
  if (expected === '@any') {
    return;
  }

  if (expected === '@uuid') {
    expect(isUuid(actual)).toBe(true);
    return;
  }

  if (expected === '@coordinates') {
    validateCoordinates(actual);
    return;
  }

  if (expected === '@jwt_access_token') {
    validateJwtAccessToken(actual);
    return;
  }

  if (expected === '@jwt_refresh_token') {
    validateJwtRefreshToken(actual);
    return;
  }

  const defaultLiveryMatch =
    typeof expected === 'string' &&
    expected.match(/^@defaultLivery\('(.*)'\)$/);
  if (defaultLiveryMatch) {
    expect(actual).toBe(`${defaultLiveryMatch[1]} ${new Date().getFullYear()}`);
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

function isCoordinate(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).length === 2 &&
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number' &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    value.longitude >= -180 &&
    value.longitude <= 180
  );
}

// Matches either a single { latitude, longitude } point (e.g. a gate position)
// or a non-empty polygon: an array of such points (e.g. an airport/terminal shape).
function validateCoordinates(actual: any) {
  if (Array.isArray(actual)) {
    expect(actual.length).toBeGreaterThan(0);
    for (const point of actual) {
      expect(isCoordinate(point)).toBe(true);
    }
    return;
  }

  expect(isCoordinate(actual)).toBe(true);
}

function extractPayloadFromJwt(token: string): Record<string, string> {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function validateJwtToken(payload: any) {
  expect(Object.keys(payload)).toContain('sub');
  expect(Object.keys(payload)).toContain('name');
  expect(Object.keys(payload)).toContain('email');
  expect(Object.keys(payload)).toContain('role');
  expect(Object.keys(payload)).toContain('iat');
  expect(Object.keys(payload)).toContain('exp');
  expect(Object.keys(payload)).toContain('session');
  expect(Object.keys(payload)).toContain('type');
  expect(typeof payload.sub).toBe('string');
  expect(typeof payload.name).toBe('string');
  expect(typeof payload.email).toBe('string');
  expect(typeof payload.role).toBe('string');
  expect(typeof payload.iat).toBe('number');
  expect(typeof payload.exp).toBe('number');
  expect(typeof payload.session).toBe('string');
  expect(typeof payload.type).toBe('string');
}

function validateJwtAccessToken(actual: any) {
  expect(typeof actual).toBe('string');
  expect(actual.split('.').length).toBe(3);

  const payload = extractPayloadFromJwt(actual);
  validateJwtToken(payload);

  expect(payload.type).toBe('access');
  expect(Number(payload.exp) - Number(payload.iat)).toBe(15 * 60);
}

function validateJwtRefreshToken(actual: any) {
  expect(typeof actual).toBe('string');
  expect(actual.split('.').length).toBe(3);

  const payload = extractPayloadFromJwt(actual);
  validateJwtToken(payload);

  expect(payload.type).toBe('refresh');
  expect(Number(payload.exp) - Number(payload.iat)).toBe(7 * 24 * 60 * 60);
}
