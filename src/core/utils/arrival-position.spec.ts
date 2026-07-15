import { firstArrivalPosition } from './arrival-position';

const THRESHOLD = 50;

const PERIMETER = [
  { latitude: 0, longitude: 0 },
  { latitude: 0, longitude: 10 },
  { latitude: 10, longitude: 10 },
  { latitude: 10, longitude: 0 },
];

describe('firstArrivalPosition', () => {
  const approachingInside = {
    latitude: 5,
    longitude: 5,
    groundSpeed: 140,
    date: new Date('2025-01-01T15:00:00.000Z'),
  };
  const slowedInside = {
    latitude: 5,
    longitude: 6,
    groundSpeed: 30,
    date: new Date('2025-01-01T15:02:00.000Z'),
  };
  const secondSlowedInside = {
    latitude: 6,
    longitude: 6,
    groundSpeed: 15,
    date: new Date('2025-01-01T15:03:00.000Z'),
  };
  const slowedOutside = {
    latitude: 50,
    longitude: 50,
    groundSpeed: 30,
    date: new Date('2025-01-01T14:00:00.000Z'),
  };

  it('returns the first position that is inside the perimeter and below the threshold', () => {
    const path = [approachingInside, slowedInside, secondSlowedInside];
    expect(firstArrivalPosition(path, PERIMETER, THRESHOLD)).toBe(slowedInside);
  });

  it('returns null when every inside position is at or above the threshold', () => {
    const path = [approachingInside, { ...approachingInside, groundSpeed: 50 }];
    expect(firstArrivalPosition(path, PERIMETER, THRESHOLD)).toBeNull();
  });

  it('returns null when every below-threshold position is outside the perimeter', () => {
    expect(
      firstArrivalPosition([slowedOutside], PERIMETER, THRESHOLD),
    ).toBeNull();
  });

  it('ignores positions without a ground speed', () => {
    const path = [{ latitude: 5, longitude: 5 }];
    expect(firstArrivalPosition(path, PERIMETER, THRESHOLD)).toBeNull();
  });

  it('picks the chronologically earliest qualifying position', () => {
    const path = [approachingInside, slowedInside, secondSlowedInside];
    expect(firstArrivalPosition(path, PERIMETER, THRESHOLD)).toBe(slowedInside);
  });

  it('returns null for an empty path', () => {
    expect(firstArrivalPosition([], PERIMETER, THRESHOLD)).toBeNull();
  });
});
