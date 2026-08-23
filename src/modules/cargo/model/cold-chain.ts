import {
  Commodity,
  TemperatureProfile,
  TemperatureRegime,
  TemperatureSolution,
} from './commodity.model';
import { OfferedCommodity } from './commodity-selection';

export enum ColdChainRisk {
  Low = 'low',
  Elevated = 'elevated',
  High = 'high',
}

export const CRITICAL_AMBIENT_C = 30;
export const LONG_CONNECTION_HOURS = 8;
export const ACTIVE_ENDURANCE_HOURS = 100;
const AMBIENT_EXPOSURE_HOURS = 2;
const ELEVATED_MARGIN_FRACTION = 0.5;
const METAR_TEMPERATURE = /\s(M?\d{2})\/(M?\d{2})\s/;

export type ColdChainExposure = {
  buildUpHours: number;
  flightHours: number;
  connectionHours: number | null;
  onwardFlightHours: number | null;
  ambientC: number | null;
};

export type ColdChainAssessment = {
  regime: TemperatureRegime;
  minC: number;
  maxC: number;
  solution: TemperatureSolution;
  setPointC: number | null;
  enduranceHours: number;
  exposureHours: number;
  marginHours: number;
  risk: ColdChainRisk;
  explanation: string;
  advisory: boolean;
};

export function ambientFromMetar(metar: string | null): number | null {
  if (!metar) {
    return null;
  }

  const matched = METAR_TEMPERATURE.exec(metar);

  if (!matched) {
    return null;
  }

  const raw = matched[1];

  return raw.startsWith('M') ? -Number(raw.slice(1)) : Number(raw);
}

export function exposureHoursOf(exposure: ColdChainExposure): number {
  return round1(
    exposure.buildUpHours +
      exposure.flightHours +
      (exposure.connectionHours ?? 0) +
      (exposure.onwardFlightHours ?? 0),
  );
}

export function setPointOf(profile: TemperatureProfile): number | null {
  return profile.solution === TemperatureSolution.Active
    ? Math.round((profile.minC + profile.maxC) / 2)
    : null;
}

export function assessColdChain(
  profile: TemperatureProfile,
  exposure: ColdChainExposure,
): ColdChainAssessment {
  const exposureHours = exposureHoursOf(exposure);
  const marginHours = round1(profile.enduranceHours - exposureHours);
  const active = profile.solution === TemperatureSolution.Active;
  const solution = solutionPhrase(profile.solution);
  const waiting = (exposure.connectionHours ?? 0) >= AMBIENT_EXPOSURE_HOURS;
  const hotRamp =
    exposure.ambientC !== null &&
    exposure.ambientC > CRITICAL_AMBIENT_C &&
    waiting &&
    !active;
  const longConnection =
    (exposure.connectionHours ?? 0) > LONG_CONNECTION_HOURS && !active;

  const base = {
    regime: profile.regime,
    minC: profile.minC,
    maxC: profile.maxC,
    solution: profile.solution,
    setPointC: setPointOf(profile),
    enduranceHours: profile.enduranceHours,
    exposureHours,
    marginHours,
    advisory: true,
  };

  if (marginHours <= 0) {
    return {
      ...base,
      risk: ColdChainRisk.High,
      explanation: `Exposure of ${exposureHours} h exceeds the ${profile.enduranceHours} h endurance of ${solution}.`,
    };
  }

  if (hotRamp) {
    return {
      ...base,
      risk: ColdChainRisk.High,
      explanation: `${exposure.ambientC} °C at the transfer point exceeds what ${solution} is validated for.`,
    };
  }

  if (longConnection) {
    return {
      ...base,
      risk: ColdChainRisk.High,
      explanation: `${articleFor(exposure.connectionHours!)} ${exposure.connectionHours} h connection leaves the shipment on ${solution} longer than it should be.`,
    };
  }

  if (
    !active &&
    marginHours < profile.enduranceHours * ELEVATED_MARGIN_FRACTION
  ) {
    return {
      ...base,
      risk: ColdChainRisk.Elevated,
      explanation: `${capitalise(solution)} with ${marginHours} h margin on a ${profile.enduranceHours} h endurance; no cooling available in flight.`,
    };
  }

  return {
    ...base,
    risk: ColdChainRisk.Low,
    explanation: `${capitalise(solution)} with ${marginHours} h margin on a ${profile.enduranceHours} h endurance.`,
  };
}

export function needsBetterSolution(
  profile: TemperatureProfile,
  exposureHours: number,
): boolean {
  return (
    profile.solution !== TemperatureSolution.Active &&
    profile.enduranceHours < exposureHours
  );
}

export function withSuitableSolution(
  commodity: Commodity,
  exposureHours: number,
): Commodity {
  if (
    !commodity.temperature ||
    !needsBetterSolution(commodity.temperature, exposureHours)
  ) {
    return commodity;
  }

  return {
    ...commodity,
    temperature: {
      ...commodity.temperature,
      solution: TemperatureSolution.Active,
      enduranceHours: ACTIVE_ENDURANCE_HOURS,
    },
  };
}

export function upgradeOfferedSolutions(
  offered: OfferedCommodity[],
  exposureHours: number,
): OfferedCommodity[] {
  return offered.map((offer) => ({
    ...offer,
    commodity: withSuitableSolution(offer.commodity, exposureHours),
  }));
}

function solutionPhrase(solution: TemperatureSolution): string {
  if (solution === TemperatureSolution.Active) {
    return 'an active container';
  }

  return solution === TemperatureSolution.DryIce
    ? 'a dry ice pack'
    : 'a passive shipper';
}

function articleFor(value: number): string {
  const digits = String(Math.floor(value));

  if (digits.startsWith('8') || digits === '11' || digits === '18') {
    return 'An';
  }

  return 'A';
}

function capitalise(phrase: string): string {
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
