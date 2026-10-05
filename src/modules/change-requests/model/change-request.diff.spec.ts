import { plainToInstance } from 'class-transformer';
import { Coordinates } from '../../airports/model/airport.model';
import { changesAnything, diffChangeRequest } from './change-request.diff';

type Values = {
  name: string;
  timezone: string;
  location: { latitude: number; longitude: number };
  shape: { latitude: number; longitude: number }[] | null;
  cityId: string;
};

const fields = ['name', 'timezone', 'location', 'shape', 'cityId'] as const;

const current: Values = {
  name: 'Warsaw Chopin',
  timezone: 'Europe/Warsaw',
  location: { latitude: 52.16575, longitude: 20.967123 },
  shape: null,
  cityId: 'ec2d2121-804b-4f8f-a9d7-991ebd8465e8',
};

describe('diffChangeRequest', () => {
  it('lists only the fields the change touches, in field order', () => {
    const diff = diffChangeRequest(fields, current, {
      cityId: '5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83',
      name: 'Warsaw Chopin Airport',
    });

    expect(diff).toEqual([
      {
        field: 'name',
        current: 'Warsaw Chopin',
        proposed: 'Warsaw Chopin Airport',
      },
      {
        field: 'cityId',
        current: 'ec2d2121-804b-4f8f-a9d7-991ebd8465e8',
        proposed: '5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83',
      },
    ]);
  });

  it('ignores keys outside the field list', () => {
    const stored = { dataQuality: 'flagship', timezone: 'Europe/Berlin' };

    const diff = diffChangeRequest(
      fields,
      current,
      stored as Partial<typeof current>,
    );

    expect(diff.map(({ field }) => field)).toEqual(['timezone']);
  });

  it('reports every current value as null when the record is gone', () => {
    const diff = diffChangeRequest<Values>(fields, null, {
      name: 'Warsaw Chopin Airport',
    });

    expect(diff).toEqual([
      { field: 'name', current: null, proposed: 'Warsaw Chopin Airport' },
    ]);
  });

  it('keeps a null current value as null', () => {
    const shape = [
      { latitude: 1, longitude: 1 },
      { latitude: 2, longitude: 2 },
      { latitude: 3, longitude: 1 },
    ];

    const diff = diffChangeRequest(fields, current, { shape });

    expect(diff).toEqual([{ field: 'shape', current: null, proposed: shape }]);
  });
});

describe('changesAnything', () => {
  it('is false when every proposed value equals the current one', () => {
    const diff = diffChangeRequest(fields, current, {
      name: 'Warsaw Chopin',
      location: { longitude: 20.967123, latitude: 52.16575 },
    });

    expect(changesAnything(diff)).toBe(false);
  });

  it('compares geometry by value', () => {
    const diff = diffChangeRequest(fields, current, {
      location: { latitude: 52.1657, longitude: 20.967123 },
    });

    expect(changesAnything(diff)).toBe(true);
  });

  it('compares geometry by value whatever class the proposed value is', () => {
    const diff = diffChangeRequest(fields, current, {
      location: plainToInstance(Coordinates, {
        latitude: 52.16575,
        longitude: 20.967123,
      }),
    });

    expect(changesAnything(diff)).toBe(false);
  });

  it('is true when one of several fields differs', () => {
    const diff = diffChangeRequest(fields, current, {
      name: 'Warsaw Chopin',
      timezone: 'Europe/Berlin',
    });

    expect(changesAnything(diff)).toBe(true);
  });

  it('is false for an empty diff', () => {
    expect(changesAnything([])).toBe(false);
  });
});
