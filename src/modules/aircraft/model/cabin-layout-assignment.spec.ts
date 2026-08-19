import {
  AssignedLayout,
  toAircraftCabinLayout,
} from './cabin-layout-assignment';

const kl738: AssignedLayout = {
  id: 'kl-738',
  airlineIata: 'KL',
  aircraftIata: '738',
  variant: null,
  retiredAt: null,
  versions: [],
};

describe('aircraft cabin layout assignment', () => {
  it('reports no layout when none is assigned', () => {
    expect(toAircraftCabinLayout(null, 'KL', '738')).toBeNull();
  });

  it('follows the newest stored revision', () => {
    const layout = toAircraftCabinLayout(
      { ...kl738, versions: [{ revision: 3 }] },
      'KL',
      '738',
    );

    expect(layout?.revision).toBe(3);
  });

  it('reports no revision before the seat map has been read', () => {
    expect(toAircraftCabinLayout(kl738, 'KL', '738')?.revision).toBeNull();
  });

  it('leaves a matching layout unflagged', () => {
    const layout = toAircraftCabinLayout(kl738, 'KL', '738');

    expect(layout?.mismatched).toBe(false);
    expect(layout?.retired).toBe(false);
  });

  it('flags a layout belonging to another airline', () => {
    expect(toAircraftCabinLayout(kl738, 'AA', '738')?.mismatched).toBe(true);
  });

  it('flags a layout drawn for another aircraft type', () => {
    expect(toAircraftCabinLayout(kl738, 'KL', '77W')?.mismatched).toBe(true);
  });

  it('flags a layout on an aircraft whose type has no IATA code', () => {
    expect(toAircraftCabinLayout(kl738, 'KL', null)?.mismatched).toBe(true);
  });

  it('reports a layout withdrawn upstream as retired', () => {
    const layout = toAircraftCabinLayout(
      { ...kl738, retiredAt: new Date('2026-08-10T00:00:00.000Z') },
      'KL',
      '738',
    );

    expect(layout?.retired).toBe(true);
  });
});
