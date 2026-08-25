import { Continent } from '../../airports/model/airport.model';

export enum SpecialHandlingCode {
  ActiveTemperatureControl = 'ACT',
  Perishable = 'PER',
  PerishableMeat = 'PEM',
  PerishableSeafood = 'PES',
  PerishableFlowers = 'PEF',
  PerishableProduce = 'PEP',
  Foodstuffs = 'EAT',
  Cool = 'COL',
  ControlledRoomTemperature = 'CRT',
  Frozen = 'FRO',
  LiveAnimals = 'AVI',
  LiveAnimalsHold = 'AVIH',
  HatchingEggs = 'HEG',
  HumanRemains = 'HUM',
  LivingOrgans = 'LHO',
  Valuable = 'VAL',
  Vulnerable = 'VUN',
  Pharmaceuticals = 'PIL',
  UndevelopedFilm = 'FIL',
  Heavy = 'HEA',
  Outsized = 'BIG',
  Wet = 'WET',
  Obnoxious = 'OBX',
  CargoAircraftOnly = 'CAO',
  MunitionsOfWar = 'MUW',
  SportingWeapons = 'SWP',
  DryIce = 'ICE',
  Magnetised = 'MAG',
  DiplomaticMail = 'DIP',
  Mail = 'MAL',
  CompanyMail = 'COM',
  Express = 'XPS',
  Newspapers = 'NWP',
  DangerousGoods = 'DGR',
  FlammableLiquid = 'RFL',
  FlammableGas = 'RFG',
  ToxicGas = 'RPG',
  NonFlammableGas = 'RNG',
  FlammableSolid = 'RFS',
  SpontaneouslyCombustible = 'RSC',
  DangerousWhenWet = 'RFW',
  Oxidizer = 'ROX',
  OrganicPeroxide = 'ROP',
  Toxic = 'RPB',
  InfectiousSubstance = 'RIS',
  RadioactiveWhite = 'RRW',
  RadioactiveYellow = 'RRY',
  Corrosive = 'RCM',
  MiscellaneousDangerousGoods = 'RMD',
  LithiumIon = 'RLI',
  LithiumMetal = 'RLM',
  LithiumIonInEquipment = 'ELI',
  LithiumMetalInEquipment = 'ELM',
  ExplosivesDivision14S = 'RXS',
  ExplosivesDivision14G = 'RXG',
}

export enum TemperatureRegime {
  ControlledRoomTemperature = 'CRT',
  Cool = 'COL',
  Frozen = 'FRO',
}

export enum TemperatureSolution {
  Active = 'active',
  Passive = 'passive',
  DryIce = 'dry_ice',
}

export enum HazardClass {
  Explosives = '1',
  FlammableGas = '2.1',
  NonFlammableGas = '2.2',
  ToxicGas = '2.3',
  FlammableLiquid = '3',
  FlammableSolid = '4.1',
  SpontaneouslyCombustible = '4.2',
  DangerousWhenWet = '4.3',
  Oxidizer = '5.1',
  OrganicPeroxide = '5.2',
  ToxicSubstance = '6.1',
  InfectiousSubstance = '6.2',
  Radioactive = '7',
  Corrosive = '8',
  Miscellaneous = '9',
}

export enum PackingGroup {
  High = 'I',
  Medium = 'II',
  Low = 'III',
}

export enum DrillLetter {
  Anaesthetic = 'A',
  Corrosive = 'C',
  Explosive = 'E',
  Flammable = 'F',
  HighlyIgnitable = 'H',
  Irritant = 'I',
  OtherRiskLowOrNone = 'L',
  Magnetic = 'M',
  Noxious = 'N',
  Toxic = 'P',
  SpontaneouslyCombustible = 'S',
  WetGivesOffGas = 'W',
  Oxidizer = 'X',
  Infectious = 'Y',
}

export enum OffloadPriority {
  General = 1,
  Standard = 2,
  Express = 3,
  Perishable = 4,
  Sensitive = 5,
  Never = 6,
}

const DRILL_NUMBER_BY_HAZARD_CLASS: Record<HazardClass, number> = {
  [HazardClass.Explosives]: 1,
  [HazardClass.FlammableGas]: 10,
  [HazardClass.NonFlammableGas]: 2,
  [HazardClass.ToxicGas]: 6,
  [HazardClass.FlammableLiquid]: 3,
  [HazardClass.FlammableSolid]: 3,
  [HazardClass.SpontaneouslyCombustible]: 4,
  [HazardClass.DangerousWhenWet]: 4,
  [HazardClass.Oxidizer]: 5,
  [HazardClass.OrganicPeroxide]: 5,
  [HazardClass.ToxicSubstance]: 6,
  [HazardClass.InfectiousSubstance]: 11,
  [HazardClass.Radioactive]: 7,
  [HazardClass.Corrosive]: 8,
  [HazardClass.Miscellaneous]: 9,
};

export const ERC_PATTERN = /^(?:[1-9]|1[01])[ACEFHILMNPSWXY]+$/;

export const SPECIAL_HANDLING_CODES: string[] =
  Object.values(SpecialHandlingCode);

export const DRILL_LETTERS: string[] = Object.values(DrillLetter);

export function drillNumberForHazardClass(hazardClass: HazardClass): number {
  return DRILL_NUMBER_BY_HAZARD_CLASS[hazardClass];
}

export function drillNumberOf(ercCode: string): number {
  return Number(ercCode.match(/^\d+/)?.[0] ?? 0);
}

export function drillLettersOf(ercCode: string): string[] {
  return ercCode.replace(/^\d+/, '').split('');
}

export type PieceProfile = {
  minKg: number;
  maxKg: number;
  packaging: string;
};

export type HeaviestPiece = {
  kg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export type TemperatureProfile = {
  regime: TemperatureRegime;
  minC: number;
  maxC: number;
  solution: TemperatureSolution;
  enduranceHours: number;
};

export type DangerousGoodsProfile = {
  unNumber: string;
  properShippingName: string;
  hazardClass: HazardClass;
  subsidiaryRisk: HazardClass | null;
  packingGroup: PackingGroup | null;
  netPerPackage: string;
  cargoAircraftOnly: boolean;
  ercCode: string;
  sourceNote?: string;
};

export type CommoditySources = {
  airports: string[];
  countries: string[];
  continents: Continent[];
};

export type CompartmentRequirements = {
  requiresHeated: boolean;
  requiresVentilated: boolean;
};

export type Commodity = {
  id: string;
  name: string;
  descriptions: string[];
  shc: SpecialHandlingCode[];
  densityKgM3: number;
  piece: PieceProfile;
  minPieces: number;
  maxPieces: number;
  heaviestPiece?: HeaviestPiece;
  temperature?: TemperatureProfile;
  dangerousGoods?: DangerousGoodsProfile;
  offloadPriority: OffloadPriority;
  sources: CommoditySources;
  demand: Continent[];
  months: number[];
  peakMonths: number[];
  frequency: number;
  compartment: CompartmentRequirements;
};
