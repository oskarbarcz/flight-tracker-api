import {
  ACTIVE_ENDURANCE_HOURS,
  ambientFromMetar,
  assessColdChain,
  ColdChainExposure,
  ColdChainRisk,
  exposureHoursOf,
  needsBetterSolution,
  setPointOf,
  upgradeOfferedSolutions,
  withSuitableSolution,
} from './cold-chain';
import {
  TemperatureProfile,
  TemperatureRegime,
  TemperatureSolution,
} from './commodity.model';
import { findCommodityById } from '../data/cargo-commodities';
import { SourceTier } from './commodity-selection';

const activeVaccines: TemperatureProfile = {
  regime: TemperatureRegime.Cool,
  minC: 2,
  maxC: 8,
  solution: TemperatureSolution.Active,
  enduranceHours: 100,
};

const passiveTuna: TemperatureProfile = {
  regime: TemperatureRegime.Cool,
  minC: 0,
  maxC: 4,
  solution: TemperatureSolution.Passive,
  enduranceHours: 30,
};

function exposure(
  overrides: Partial<ColdChainExposure> = {},
): ColdChainExposure {
  return {
    buildUpHours: 3,
    flightHours: 9,
    connectionHours: null,
    onwardFlightHours: null,
    ambientC: null,
    ...overrides,
  };
}

describe('cold chain', () => {
  it('reads the temperature out of a METAR', () => {
    expect(
      ambientFromMetar('METAR EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016'),
    ).toBe(24);
    expect(
      ambientFromMetar('METAR EDDF 081200Z 27004KT 9999 FEW030 M05/M08 Q1021'),
    ).toBe(-5);
  });

  it('reads no temperature from a METAR that has none', () => {
    expect(
      ambientFromMetar('METAR EDDF 081200Z 27004KT CAVOK Q1021'),
    ).toBeNull();
    expect(ambientFromMetar(null)).toBeNull();
  });

  it('adds up every leg of the exposure', () => {
    expect(
      exposureHoursOf(
        exposure({ connectionHours: 3.5, onwardFlightHours: 1.5 }),
      ),
    ).toBe(17);
  });

  it('counts only the legs that exist', () => {
    expect(exposureHoursOf(exposure())).toBe(12);
  });

  it('gives an active container a set point at the middle of its range', () => {
    expect(setPointOf(activeVaccines)).toBe(5);
    expect(setPointOf(passiveTuna)).toBeNull();
  });

  it('reads a comfortable active margin as low risk', () => {
    const assessment = assessColdChain(activeVaccines, exposure());

    expect(assessment.risk).toBe(ColdChainRisk.Low);
    expect(assessment.marginHours).toBe(88);
    expect(assessment.explanation).toBe(
      'An active container with 88 h margin on a 100 h endurance.',
    );
  });

  it('reads a comfortable passive margin as low risk', () => {
    const assessment = assessColdChain(passiveTuna, exposure());

    expect(assessment.risk).toBe(ColdChainRisk.Low);
    expect(assessment.marginHours).toBe(18);
    expect(assessment.explanation).toBe(
      'A passive shipper with 18 h margin on a 30 h endurance.',
    );
  });

  it('reads a passive margin below half its endurance as elevated risk', () => {
    const assessment = assessColdChain(
      passiveTuna,
      exposure({ flightHours: 13 }),
    );

    expect(assessment.risk).toBe(ColdChainRisk.Elevated);
    expect(assessment.marginHours).toBe(14);
    expect(assessment.explanation).toBe(
      'A passive shipper with 14 h margin on a 30 h endurance; no cooling available in flight.',
    );
  });

  it('reads an exhausted endurance as high risk', () => {
    const assessment = assessColdChain(
      passiveTuna,
      exposure({ connectionHours: 12, onwardFlightHours: 10 }),
    );

    expect(assessment.risk).toBe(ColdChainRisk.High);
    expect(assessment.marginHours).toBeLessThanOrEqual(0);
    expect(assessment.explanation).toBe(
      'Exposure of 34 h exceeds the 30 h endurance of a passive shipper.',
    );
  });

  it('reads a hot transfer point as high risk', () => {
    const assessment = assessColdChain(
      passiveTuna,
      exposure({ flightHours: 4, connectionHours: 4, ambientC: 31 }),
    );

    expect(assessment.risk).toBe(ColdChainRisk.High);
    expect(assessment.explanation).toBe(
      '31 °C at the transfer point exceeds what a passive shipper is validated for.',
    );
  });

  it('ignores a hot transfer point for an active container', () => {
    const assessment = assessColdChain(
      activeVaccines,
      exposure({ connectionHours: 4, ambientC: 34 }),
    );

    expect(assessment.risk).toBe(ColdChainRisk.Low);
  });

  it('reads a long exposed connection as high risk', () => {
    const assessment = assessColdChain(
      { ...passiveTuna, enduranceHours: 72 },
      exposure({ flightHours: 2, connectionHours: 9 }),
    );

    expect(assessment.risk).toBe(ColdChainRisk.High);
    expect(assessment.explanation).toBe(
      'A 9 h connection leaves the shipment on a passive shipper longer than it should be.',
    );
  });

  it('reads the article of the connection length correctly', () => {
    const at = (connectionHours: number): string =>
      assessColdChain(
        { ...passiveTuna, enduranceHours: 200 },
        exposure({ flightHours: 2, connectionHours }),
      ).explanation;

    expect(at(8.8)).toContain('An 8.8 h connection');
    expect(at(11)).toContain('An 11 h connection');
    expect(at(18)).toContain('An 18 h connection');
    expect(at(9)).toContain('A 9 h connection');
    expect(at(12)).toContain('A 12 h connection');
  });

  it('leaves the assessment advisory whatever the risk', () => {
    const risks = [
      assessColdChain(activeVaccines, exposure()),
      assessColdChain(passiveTuna, exposure()),
      assessColdChain(passiveTuna, exposure({ connectionHours: 40 })),
    ];

    expect(risks.every((assessment) => assessment.advisory)).toBe(true);
  });

  it('produces the same assessment for the same inputs', () => {
    expect(assessColdChain(passiveTuna, exposure())).toEqual(
      assessColdChain(passiveTuna, exposure()),
    );
  });

  it('wants a better solution only when a passive one cannot cover the exposure', () => {
    expect(needsBetterSolution(passiveTuna, 40)).toBe(true);
    expect(needsBetterSolution(passiveTuna, 20)).toBe(false);
    expect(needsBetterSolution(activeVaccines, 400)).toBe(false);
  });

  it('upgrades a commodity whose passive solution cannot cover the exposure', () => {
    const tuna = findCommodityById('tuna-fresh')!;
    const upgraded = withSuitableSolution(tuna, 40);

    expect(tuna.temperature!.solution).toBe(TemperatureSolution.Passive);
    expect(upgraded.temperature!.solution).toBe(TemperatureSolution.Active);
    expect(upgraded.temperature!.enduranceHours).toBe(ACTIVE_ENDURANCE_HOURS);
  });

  it('leaves a commodity alone when its solution suffices', () => {
    const tuna = findCommodityById('tuna-fresh')!;

    expect(withSuitableSolution(tuna, 10)).toBe(tuna);
    expect(withSuitableSolution(findCommodityById('auto-parts')!, 400)).toBe(
      findCommodityById('auto-parts')!,
    );
  });

  it('upgrades only what needs upgrading across the offered pool', () => {
    const offered = ['tuna-fresh', 'auto-parts', 'vaccines'].map((id) => ({
      commodity: findCommodityById(id)!,
      tier: SourceTier.Generic,
      weight: 1,
    }));
    const upgraded = upgradeOfferedSolutions(offered, 40);

    expect(upgraded[0].commodity.temperature!.solution).toBe(
      TemperatureSolution.Active,
    );
    expect(upgraded[1].commodity.temperature).toBeUndefined();
    expect(upgraded[2].commodity.temperature!.enduranceHours).toBe(100);
  });
});
