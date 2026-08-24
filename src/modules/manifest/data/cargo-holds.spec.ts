import {
  AIRCRAFT_HOLD_LAYOUTS,
  findHoldLayoutByType,
  HOLD_LAYOUT_SOURCE,
} from './cargo-holds';
import {
  CargoDeck,
  CompartmentLoading,
  compartmentsOf,
  positionsOf,
} from '../model/hold-layout.model';
import {
  MAX_NUMERIC_ROWS,
  PositionOrdinals,
} from '../model/hold-position-expander';
import { ULD_BASE_CODES, ULD_CONTOUR_CODES } from '../model/uld-code.model';
import { findAirframeByType } from '../../airframes/data/airframes';
import { AirframeServiceType } from '../../airframes/model/airframe.model';

const SEEDED_FLEET = ['B77W', 'A339', 'B752', 'B738', 'A321', 'A320', 'A319'];
const FREIGHTERS = [
  'A225',
  'A3ST',
  'A30F',
  'B74F',
  'B48F',
  'B75F',
  'B76F',
  'B77F',
  'MD1F',
  'SH33',
];

describe('cargo holds dataset', () => {
  it('covers the seeded fleet', () => {
    const missing = SEEDED_FLEET.filter((type) => !findHoldLayoutByType(type));

    expect(missing).toEqual([]);
  });

  it('covers every freighter designator', () => {
    const missing = FREIGHTERS.filter((type) => !findHoldLayoutByType(type));

    expect(missing).toEqual([]);
  });

  it('describes only airframe types the system knows', () => {
    const unknown = AIRCRAFT_HOLD_LAYOUTS.filter(
      (layout) => !findAirframeByType(layout.type),
    ).map((layout) => layout.type);

    expect(unknown).toEqual([]);
  });

  it('declares exactly one default variant per type', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.filter(
      (layout) =>
        layout.variants.filter((variant) => variant.isDefault).length !== 1,
    ).map((layout) => layout.type);

    expect(wrong).toEqual([]);
  });

  it('makes the loosely loaded variant the default where a type offers one', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.filter((layout) => {
      const hasLooseVariant = layout.variants.some(
        (variant) => positionsOf(variant).length === 0,
      );

      if (!hasLooseVariant) {
        return false;
      }

      const fallback = layout.variants.find((variant) => variant.isDefault)!;

      return positionsOf(fallback).length > 0;
    }).map((layout) => layout.type);

    expect(wrong).toEqual([]);
  });

  it('gives every variant at least one loosely loaded compartment', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.flatMap((layout) =>
      layout.variants
        .filter(
          (variant) =>
            !compartmentsOf(variant).some(
              (compartment) => compartment.loading === CompartmentLoading.Loose,
            ),
        )
        .map((variant) => variant.id),
    );

    expect(wrong).toEqual([]);
  });

  it('declares the same compartments in every variant of a type', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.filter((layout) => {
      const signatures = layout.variants.map((variant) =>
        compartmentsOf(variant)
          .map((compartment) => compartment.number)
          .sort((one, other) => one - other)
          .join(','),
      );

      return new Set(signatures).size !== 1;
    }).map((layout) => layout.type);

    expect(wrong).toEqual([]);
  });

  it('keeps position designators unique within a variant', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.flatMap((layout) =>
      layout.variants
        .filter((variant) => {
          const designators = positionsOf(variant).map(
            (position) => position.designator,
          );

          return new Set(designators).size !== designators.length;
        })
        .map((variant) => variant.id),
    );

    expect(wrong).toEqual([]);
  });

  it('declares no positions in a loosely loaded compartment', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.flatMap((layout) =>
      layout.variants.flatMap((variant) =>
        compartmentsOf(variant)
          .filter(
            (compartment) =>
              compartment.loading === CompartmentLoading.Loose &&
              compartment.positions.length > 0,
          )
          .map((compartment) => `${variant.id}/${compartment.number}`),
      ),
    );

    expect(wrong).toEqual([]);
  });

  it('declares at least one position in a containerised compartment', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.flatMap((layout) =>
      layout.variants.flatMap((variant) =>
        compartmentsOf(variant)
          .filter(
            (compartment) =>
              compartment.loading === CompartmentLoading.Uld &&
              compartment.positions.length === 0,
          )
          .map((compartment) => `${variant.id}/${compartment.number}`),
      ),
    );

    expect(wrong).toEqual([]);
  });

  it('accepts only known ULD base and contour codes', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.flatMap((layout) =>
      layout.variants.flatMap((variant) =>
        positionsOf(variant)
          .filter(
            (position) =>
              position.acceptedBases.length === 0 ||
              position.acceptedContours.length === 0 ||
              position.acceptedBases.some(
                (base) => !ULD_BASE_CODES.includes(base),
              ) ||
              position.acceptedContours.some(
                (contour) => !ULD_CONTOUR_CODES.includes(contour),
              ),
          )
          .map((position) => `${variant.id}/${position.designator}`),
      ),
    );

    expect(wrong).toEqual([]);
  });

  it('states positive weights and volumes everywhere', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.flatMap((layout) =>
      layout.variants.flatMap((variant) =>
        compartmentsOf(variant)
          .filter(
            (compartment) =>
              compartment.maxWeightKg <= 0 ||
              compartment.volumeM3 <= 0 ||
              compartment.positions.some(
                (position) => position.maxWeightKg <= 0,
              ),
          )
          .map((compartment) => `${variant.id}/${compartment.number}`),
      ),
    );

    expect(wrong).toEqual([]);
  });

  it('keeps the positions of a compartment within its weight limit', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.flatMap((layout) =>
      layout.variants.flatMap((variant) =>
        compartmentsOf(variant)
          .filter((compartment) => {
            const positionTotal = compartment.positions.reduce(
              (sum, position) => sum + position.maxWeightKg,
              0,
            );

            return positionTotal > compartment.maxWeightKg;
          })
          .map((compartment) => `${variant.id}/${compartment.number}`),
      ),
    );

    expect(wrong).toEqual([]);
  });

  it('keeps a numerically designated compartment within nine rows', () => {
    const wrong = HOLD_LAYOUT_SOURCE.flatMap((layout) =>
      layout.variants.flatMap((variant) =>
        variant.decks.flatMap((deck) =>
          deck.compartments
            .filter(
              (compartment) =>
                compartment.positionTemplate?.ordinals ===
                  PositionOrdinals.Numeric &&
                compartment.positionTemplate.rows > MAX_NUMERIC_ROWS,
            )
            .map((compartment) => `${variant.id}/${compartment.number}`),
        ),
      ),
    );

    expect(wrong).toEqual([]);
  });

  it('overrides only positions the template produces', () => {
    const wrong = HOLD_LAYOUT_SOURCE.flatMap((layout) =>
      layout.variants.flatMap((variant) => {
        const expanded = AIRCRAFT_HOLD_LAYOUTS.find(
          (candidate) => candidate.type === layout.type,
        )!.variants.find((candidate) => candidate.id === variant.id)!;
        const designators = new Set(
          positionsOf(expanded).map((position) => position.designator),
        );

        return variant.decks.flatMap((deck) =>
          deck.compartments.flatMap((compartment) =>
            (compartment.positionOverrides ?? [])
              .filter((override) => !designators.has(override.designator))
              .map((override) => `${variant.id}/${override.designator}`),
          ),
        );
      }),
    );

    expect(wrong).toEqual([]);
  });

  it('gives a main deck only to airframes built to carry freight', () => {
    const wrong = AIRCRAFT_HOLD_LAYOUTS.filter((layout) => {
      const hasMainDeck = layout.variants.some((variant) =>
        variant.decks.some((deck) => deck.deck === CargoDeck.Main),
      );

      if (!hasMainDeck) {
        return false;
      }

      const airframe = findAirframeByType(layout.type);

      return airframe?.serviceType === AirframeServiceType.Passenger;
    }).map((layout) => layout.type);

    expect(wrong).toEqual([]);
  });

  it('matches the published container counts of the types it covers', () => {
    const countPositions = (type: string, variantId: string): number =>
      positionsOf(
        findHoldLayoutByType(type)!.variants.find(
          (variant) => variant.id === variantId,
        )!,
      ).length;

    expect(countPositions('B77W', 'b77w-ld3')).toBe(44);
    expect(countPositions('A339', 'a339-ld3')).toBe(36);
    expect(countPositions('A320', 'a320-cls')).toBe(7);
    expect(countPositions('A321', 'a321-cls')).toBe(10);
    expect(countPositions('A319', 'a319-cls')).toBe(5);
    expect(countPositions('B738', 'b738-bulk')).toBe(0);
    expect(countPositions('B752', 'b752-bulk')).toBe(0);
  });
});
