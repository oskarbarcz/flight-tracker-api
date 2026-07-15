import { firstMovingPosition } from './ground-speed';

const THRESHOLD = 3;

describe('firstMovingPosition', () => {
  const stationary = [
    { date: new Date('2025-01-01T13:00:00.000Z'), groundSpeed: 0 },
    { date: new Date('2025-01-01T13:01:00.000Z'), groundSpeed: 3 },
  ];
  const moving = [
    { date: new Date('2025-01-01T13:02:00.000Z'), groundSpeed: 12 },
    { date: new Date('2025-01-01T13:03:00.000Z'), groundSpeed: 25 },
  ];

  it('returns the earliest position above the threshold', () => {
    const path = [...stationary, ...moving];
    expect(firstMovingPosition(path, THRESHOLD)).toBe(moving[0]);
  });

  it('returns null when every position is at or below the threshold', () => {
    expect(firstMovingPosition(stationary, THRESHOLD)).toBeNull();
  });

  it('ignores positions without a ground speed', () => {
    const path = [
      { date: new Date('2025-01-01T13:00:00.000Z') },
      { date: new Date('2025-01-01T13:01:00.000Z'), groundSpeed: undefined },
    ];
    expect(firstMovingPosition(path, THRESHOLD)).toBeNull();
  });

  it('returns null for an empty path', () => {
    expect(firstMovingPosition([], THRESHOLD)).toBeNull();
  });
});
