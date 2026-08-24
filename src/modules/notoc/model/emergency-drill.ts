import {
  DrillLetter,
  drillLettersOf,
  drillNumberOf,
} from '../../cargo/model/commodity.model';

export type EmergencyDrill = {
  ercCode: string;
  inherentRisk: string;
  riskToAircraftAndOccupants: string;
  spillAndFireProcedure: string;
  additionalRisks: string[];
};

const DRILL_BY_NUMBER: Record<
  number,
  Omit<EmergencyDrill, 'ercCode' | 'additionalRisks'>
> = {
  1: {
    inherentRisk: 'Explosion, which may be a mass explosion of the whole load.',
    riskToAircraftAndOccupants:
      'Severe structural damage, up to loss of the aircraft; blast and fragments are lethal to anyone nearby.',
    spillAndFireProcedure:
      'Do not move or disturb the load. Do not attempt to fight a fire involving explosives; land as soon as possible and evacuate.',
  },
  2: {
    inherentRisk:
      'Pressure build-up and violent rupture of the receptacle; the gas itself neither burns nor poisons.',
    riskToAircraftAndOccupants:
      'Flying fragments on rupture and displacement of cabin air; a refrigerated gas also freezes what it touches.',
    spillAndFireProcedure:
      'Ventilate; use oxygen masks if the air is displaced. Fight a surrounding fire with any available agent and cool the receptacle.',
  },
  3: {
    inherentRisk:
      'Flammable liquid or solid; vapours may form an explosive mixture.',
    riskToAircraftAndOccupants:
      'Rapid fire spread and dense smoke; heat may weaken structure and burn anyone in reach.',
    spillAndFireProcedure:
      'Contain the spill and keep every ignition source away. Fight the fire with water spray, foam, dry chemical or carbon dioxide.',
  },
  4: {
    inherentRisk:
      'Ignites on its own, or gives off flammable gas on contact with water.',
    riskToAircraftAndOccupants:
      'Fire that reignites after it appears to be out; burns and toxic fumes to anyone nearby.',
    spillAndFireProcedure:
      'Keep the load dry and do not use water on a water-reactive substance. Smother with dry chemical, dry sand or carbon dioxide.',
  },
  5: {
    inherentRisk:
      'Yields oxygen and so intensifies any fire; an organic peroxide may also decompose violently when warm.',
    riskToAircraftAndOccupants:
      'Fire that burns without outside air and cannot be smothered; heat, and burns on contact.',
    spillAndFireProcedure:
      'Keep away from combustible material and from heat. Flood with water, which is the only effective agent; smothering will not work.',
  },
  6: {
    inherentRisk: 'Toxic by inhalation, ingestion or contact with skin.',
    riskToAircraftAndOccupants:
      'Poisoning of anyone exposed; a toxic gas contaminates the whole compartment quickly.',
    spillAndFireProcedure:
      'Do not enter the compartment without protective breathing equipment; keep the area sealed and ventilate on the ground. Fight a fire with any agent suited to the surrounding material.',
  },
  7: {
    inherentRisk:
      'Ionising radiation, contained while the package is intact and released if it is damaged.',
    riskToAircraftAndOccupants:
      'Contamination and radiation dose if a package is broken; an intact package presents no hazard in flight.',
    spillAndFireProcedure:
      'Do not handle a damaged package; keep everyone clear and record who was exposed. Fight the fire normally and treat the residue as contaminated.',
  },
  8: {
    inherentRisk:
      'Corrosive to skin, eyes and metal; may give off corrosive vapour.',
    riskToAircraftAndOccupants:
      'Attacks aircraft structure and wiring; severe burns to skin and eyes and damage to the airways.',
    spillAndFireProcedure:
      'Avoid contact and ventilate; flush affected skin with water. Fight the fire with water spray, which also disperses the vapour.',
  },
  9: {
    inherentRisk:
      'A hazard that no other class covers, such as heat, an anaesthetic vapour, a magnetic field or harm to the environment.',
    riskToAircraftAndOccupants:
      'Depends on the substance; may affect instruments, air quality or the health of anyone exposed.',
    spillAndFireProcedure:
      'Ventilate and keep clear of the spill. Fight the fire with the agent suited to the surrounding material.',
  },
  10: {
    inherentRisk:
      'Flammable gas, which may form an explosive mixture with air.',
    riskToAircraftAndOccupants:
      'Explosion or flash fire on release; asphyxiation where the gas displaces air.',
    spillAndFireProcedure:
      'Ventilate and remove every ignition source; do not put out a burning jet until the flow can be stopped. Cool surrounding receptacles with water.',
  },
  11: {
    inherentRisk:
      'Infectious substance capable of causing disease in humans or animals.',
    riskToAircraftAndOccupants:
      'Infection of anyone in contact with a leaking package; the aircraft itself is unaffected.',
    spillAndFireProcedure:
      'Do not touch a leaking package; seal off the area and disinfect on the ground. Fight the fire normally and treat the residue as contaminated.',
  },
};

const ADDITIONAL_RISK_BY_LETTER: Record<DrillLetter, string> = {
  [DrillLetter.Anaesthetic]: 'Anaesthetic or narcotic vapour.',
  [DrillLetter.Corrosive]: 'Corrosive to skin, eyes and aircraft structure.',
  [DrillLetter.Explosive]: 'May explode.',
  [DrillLetter.Flammable]: 'Flammable.',
  [DrillLetter.HighlyIgnitable]: 'Ignites very easily.',
  [DrillLetter.Irritant]: 'Irritating to skin, eyes and airways.',
  [DrillLetter.OtherRiskLowOrNone]:
    'No significant risk beyond the drill itself.',
  [DrillLetter.Magnetic]: 'Magnetic field may disturb aircraft instruments.',
  [DrillLetter.Noxious]: 'Noxious or offensive fumes.',
  [DrillLetter.Toxic]: 'Toxic if inhaled, swallowed or absorbed through skin.',
  [DrillLetter.SpontaneouslyCombustible]:
    'May ignite without an ignition source.',
  [DrillLetter.WetGivesOffGas]:
    'Gives off poisonous or flammable gas when wet; do not use water.',
  [DrillLetter.Oxidizer]: 'Yields oxygen and intensifies fire.',
  [DrillLetter.Infectious]: 'Infectious.',
};

export function drillFor(ercCode: string): EmergencyDrill | null {
  const drill = DRILL_BY_NUMBER[drillNumberOf(ercCode)];

  if (!drill) {
    return null;
  }

  return {
    ercCode,
    ...drill,
    additionalRisks: drillLettersOf(ercCode)
      .map((letter) => ADDITIONAL_RISK_BY_LETTER[letter as DrillLetter])
      .filter((risk): risk is string => risk !== undefined),
  };
}
