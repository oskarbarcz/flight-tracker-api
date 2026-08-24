import { drillFor } from './emergency-drill';
import { COMMODITIES } from '../../cargo/data/cargo-commodities';
import {
  DRILL_LETTERS,
  drillNumberForHazardClass,
  drillNumberOf,
} from '../../cargo/model/commodity.model';

describe('drillFor', () => {
  it('answers a drill for every dangerous goods entry in the catalogue', () => {
    const declared = COMMODITIES.map(
      (commodity) => commodity.dangerousGoods,
    ).filter((profile) => profile !== undefined);
    const undrilled = declared.filter(
      (profile) => drillFor(profile!.ercCode) === null,
    );

    expect(declared.length).toBeGreaterThan(0);
    expect(undrilled).toEqual([]);
  });

  it('reports the drill the hazard class maps to', () => {
    const paint = drillFor('3L')!;

    expect(paint.ercCode).toBe('3L');
    expect(paint.inherentRisk).toContain('Flammable liquid');
    expect(paint.additionalRisks).toEqual([
      'No significant risk beyond the drill itself.',
    ]);
  });

  it('names one additional risk per drill letter', () => {
    const drill = drillFor('6PC')!;

    expect(drill.additionalRisks).toHaveLength(2);
    expect(drill.additionalRisks[0]).toContain('Toxic');
    expect(drill.additionalRisks[1]).toContain('Corrosive');
  });

  it('carries an inherent risk, a risk to the aircraft and a procedure on every entry', () => {
    const incomplete = COMMODITIES.map((commodity) => commodity.dangerousGoods)
      .filter((profile) => profile !== undefined)
      .map((profile) => drillFor(profile!.ercCode)!)
      .filter(
        (drill) =>
          drill.inherentRisk.length === 0 ||
          drill.riskToAircraftAndOccupants.length === 0 ||
          drill.spillAndFireProcedure.length === 0,
      );

    expect(incomplete).toEqual([]);
  });

  it('agrees with the drill number the hazard class prescribes', () => {
    const wrong = COMMODITIES.filter(
      (commodity) => commodity.dangerousGoods,
    ).filter(
      (commodity) =>
        drillNumberOf(commodity.dangerousGoods!.ercCode) !==
        drillNumberForHazardClass(commodity.dangerousGoods!.hazardClass),
    );

    expect(wrong).toEqual([]);
  });

  it('knows an additional risk for every letter in the vocabulary', () => {
    const unmapped = DRILL_LETTERS.filter(
      (letter) => drillFor(`3${letter}`)!.additionalRisks.length === 0,
    );

    expect(unmapped).toEqual([]);
  });

  it('answers nothing for a code whose drill number is not in the chart', () => {
    expect(drillFor('12L')).toBeNull();
    expect(drillFor('0L')).toBeNull();
  });
});
