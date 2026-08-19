import { collapseDeckPairs } from './deck-collapse';
import { AerolopaLayout } from '../../../core/provider/aerolopa/type/aerolopa.types';

function layout(
  id: string,
  airlineIata: string,
  aircraftIata: string,
  variant: string | null,
): AerolopaLayout {
  return { id, airlineIata, aircraftIata, variant };
}

function byId(id: string) {
  return (collapsed: { id: string }) => collapsed.id === id;
}

describe('collapseDeckPairs', () => {
  it('merges a complete deck pair into one layout', () => {
    const result = collapseDeckPairs([
      layout('lh-74h-m', 'LH', '74H', 'm'),
      layout('lh-74h-u', 'LH', '74H', 'u'),
    ]);

    expect(result).toEqual([
      {
        id: 'lh-74h',
        airlineIata: 'LH',
        aircraftIata: '74H',
        variant: null,
        sourceSlugs: ['lh-74h-m', 'lh-74h-u'],
      },
    ]);
  });

  it('keeps the ordinal when a numbered configuration is deck split', () => {
    const result = collapseDeckPairs([
      layout('lh-388-2-m', 'LH', '388', '2-m'),
      layout('lh-388-2-u', 'LH', '388', '2-u'),
    ]);

    expect(result).toEqual([
      {
        id: 'lh-388-2',
        airlineIata: 'LH',
        aircraftIata: '388',
        variant: '2',
        sourceSlugs: ['lh-388-2-m', 'lh-388-2-u'],
      },
    ]);
  });

  it('leaves a deck-marked layout alone when its sibling is missing', () => {
    const result = collapseDeckPairs([layout('sq-359-m', 'SQ', '359', 'm')]);

    expect(result).toEqual([
      {
        id: 'sq-359-m',
        airlineIata: 'SQ',
        aircraftIata: '359',
        variant: 'm',
        sourceSlugs: ['sq-359-m'],
      },
    ]);
  });

  it('never mistakes an ordinal variant for a deck', () => {
    const result = collapseDeckPairs([
      layout('lo-7m8-1', 'LO', '7M8', '1'),
      layout('lo-7m8-2', 'LO', '7M8', '2'),
      layout('lo-7m8-3', 'LO', '7M8', '3'),
    ]);

    expect(result.map(({ id }) => id).sort()).toEqual([
      'lo-7m8-1',
      'lo-7m8-2',
      'lo-7m8-3',
    ]);
    expect(result.every(({ sourceSlugs }) => sourceSlugs.length === 1)).toBe(
      true,
    );
  });

  it('passes layouts with no variant straight through', () => {
    const result = collapseDeckPairs([layout('lh-32n', 'LH', '32N', null)]);

    expect(result).toEqual([
      {
        id: 'lh-32n',
        airlineIata: 'LH',
        aircraftIata: '32N',
        variant: null,
        sourceSlugs: ['lh-32n'],
      },
    ]);
  });

  it('does not merge when the merged identifier is already taken', () => {
    const result = collapseDeckPairs([
      layout('xx-999', 'XX', '999', null),
      layout('xx-999-m', 'XX', '999', 'm'),
      layout('xx-999-u', 'XX', '999', 'u'),
    ]);

    expect(result.map(({ id }) => id).sort()).toEqual([
      'xx-999',
      'xx-999-m',
      'xx-999-u',
    ]);
  });

  it('does not merge two layouts of the same deck', () => {
    const result = collapseDeckPairs([
      layout('xx-388-1-m', 'XX', '388', '1-m'),
      layout('xx-388-2-m', 'XX', '388', '2-m'),
    ]);

    expect(result.map(({ id }) => id).sort()).toEqual([
      'xx-388-1-m',
      'xx-388-2-m',
    ]);
  });

  it('collapses a realistic index without losing or duplicating layouts', () => {
    const result = collapseDeckPairs([
      layout('lh-32n', 'LH', '32N', null),
      layout('lo-7m8-1', 'LO', '7M8', '1'),
      layout('lo-7m8-2', 'LO', '7M8', '2'),
      layout('aa-77w', 'AA', '77W', null),
      layout('aa-77w-2', 'AA', '77W', '2'),
      layout('lh-74h-m', 'LH', '74H', 'm'),
      layout('lh-74h-u', 'LH', '74H', 'u'),
      layout('sq-359-m', 'SQ', '359', 'm'),
    ]);

    expect(result).toHaveLength(7);
    expect(result.filter(byId('lh-74h'))).toHaveLength(1);
    expect(result.filter(byId('lh-74h-m'))).toHaveLength(0);
    expect(result.filter(byId('lh-74h-u'))).toHaveLength(0);
    expect(result.filter(byId('sq-359-m'))).toHaveLength(1);
    expect(new Set(result.map(({ id }) => id)).size).toBe(result.length);
  });
});
