import { ApiProperty } from '@nestjs/swagger';
import { UldBaseCode, UldContourCode } from './uld-code.model';
import { CURATED_HOLD_TYPES } from '../data/hold-identifiers';

export enum CargoDeck {
  Main = 'main',
  Lower = 'lower',
}

export enum CompartmentLoading {
  Uld = 'uld',
  Loose = 'loose',
}

export enum HoldCompartmentName {
  Forward = 'forward',
  Aft = 'aft',
  Bulk = 'bulk',
  Main = 'main',
}

export enum HoldPositionSide {
  Left = 'L',
  Right = 'R',
  Full = 'full',
}

export enum CargoDoorSide {
  Left = 'left',
  Right = 'right',
  Nose = 'nose',
  None = 'none',
}

export class HoldPosition {
  @ApiProperty({
    description:
      'Position identifier, composed as compartment number, ordinal within the compartment and side. This is a convention of this system, not a published designation: no public source designates hold positions for a given airframe type. It is unique within a variant and stable across reads.',
    example: '12R',
  })
  designator!: string;

  @ApiProperty({
    description: 'Number of the compartment the position sits in',
    example: 1,
  })
  compartment!: number;

  @ApiProperty({
    description: 'Side of the hold the position sits on',
    enum: HoldPositionSide,
    example: HoldPositionSide.Right,
  })
  side!: HoldPositionSide;

  @ApiProperty({
    description:
      'ULD base sizes the position accepts, as the second letter of an IATA ULD type code',
    enum: UldBaseCode,
    isArray: true,
    example: [UldBaseCode.Ld3],
  })
  acceptedBases!: UldBaseCode[];

  @ApiProperty({
    description:
      'ULD contours the position accepts, as the third letter of an IATA ULD type code. Positions where the fuselage tapers accept fewer contours than those further forward.',
    enum: UldContourCode,
    isArray: true,
    example: [UldContourCode.Ld3FullHeight, UldContourCode.Ld3ReducedHeight],
  })
  acceptedContours!: UldContourCode[];

  @ApiProperty({
    description: 'Heaviest load the position accepts, in kilograms',
    example: 1588,
  })
  maxWeightKg!: number;
}

export class HoldCompartment {
  @ApiProperty({
    description: 'Compartment number, counted from the nose',
    example: 1,
  })
  number!: number;

  @ApiProperty({
    description: 'Where in the aircraft the compartment sits',
    enum: HoldCompartmentName,
    example: HoldCompartmentName.Forward,
  })
  name!: HoldCompartmentName;

  @ApiProperty({
    description:
      'How the compartment is loaded. A loosely loaded compartment declares no positions.',
    enum: CompartmentLoading,
    example: CompartmentLoading.Uld,
  })
  loading!: CompartmentLoading;

  @ApiProperty({
    description: 'Heaviest load the compartment accepts, in kilograms',
    example: 17280,
  })
  maxWeightKg!: number;

  @ApiProperty({
    description: 'Usable volume of the compartment in cubic metres',
    example: 74.2,
  })
  volumeM3!: number;

  @ApiProperty({
    description:
      'Whether the compartment is heated, which a live animal load requires',
    example: true,
  })
  heated!: boolean;

  @ApiProperty({
    description:
      'Whether the compartment is ventilated, which a live animal load requires and dry ice makes unsafe to share',
    example: true,
  })
  ventilated!: boolean;

  @ApiProperty({
    description: 'Side the compartment is loaded from',
    enum: CargoDoorSide,
    example: CargoDoorSide.Right,
  })
  doorSide!: CargoDoorSide;

  @ApiProperty({
    description:
      'ULD positions the compartment contains; empty for a loosely loaded compartment',
    type: HoldPosition,
    isArray: true,
  })
  positions!: HoldPosition[];
}

export class HoldDeck {
  @ApiProperty({
    description: 'Deck the compartments sit on',
    enum: CargoDeck,
    example: CargoDeck.Lower,
  })
  deck!: CargoDeck;

  @ApiProperty({ type: HoldCompartment, isArray: true })
  compartments!: HoldCompartment[];
}

export class HoldVariant {
  @ApiProperty({
    description:
      'Identifier of the variant, as assigned to an aircraft. Variants of one type differ in the positions available rather than in the compartments themselves.',
    example: 'b77w-ld3',
  })
  id!: string;

  @ApiProperty({
    description:
      'Whether this is the variant an aircraft of this type uses when none is assigned to it. Exactly one variant of a type is the default, and where a type offers both a loosely loaded and a containerised variant the loosely loaded one is the default.',
    example: true,
  })
  isDefault!: boolean;

  @ApiProperty({ type: HoldDeck, isArray: true })
  decks!: HoldDeck[];
}

export class AircraftHoldLayout {
  @ApiProperty({
    description: 'ICAO aircraft type designator the configuration describes',
    enum: CURATED_HOLD_TYPES,
    example: 'B77W',
  })
  type!: string;

  @ApiProperty({ type: HoldVariant, isArray: true })
  variants!: HoldVariant[];
}

export function findVariant(
  layout: AircraftHoldLayout,
  id: string,
): HoldVariant | undefined {
  return layout.variants.find((variant) => variant.id === id);
}

export function defaultVariantOf(layout: AircraftHoldLayout): HoldVariant {
  return layout.variants.find((variant) => variant.isDefault)!;
}

export function compartmentsOf(variant: HoldVariant): HoldCompartment[] {
  return variant.decks.flatMap((deck) => deck.compartments);
}

export function positionsOf(variant: HoldVariant): HoldPosition[] {
  return compartmentsOf(variant).flatMap(
    (compartment) => compartment.positions,
  );
}
