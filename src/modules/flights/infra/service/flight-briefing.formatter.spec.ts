import {
  BriefingInput,
  formatBlockTime,
  formatFlightBriefing,
  formatFlightNumber,
} from './flight-briefing.formatter';

const OFP_URL = 'https://www.simbrief.com/ofp/flightplans/EDDFKEWR_PDF.pdf';
const FLIGHT_URL = 'https://flights.example.com/map/flight-id';

function briefing(overrides: Partial<BriefingInput> = {}): BriefingInput {
  return {
    flightNumber: 'LH55',
    departure: { city: 'Frankfurt', iataCode: 'FRA' },
    destination: { city: 'Newark', iataCode: 'EWR' },
    aircraft: { registration: 'D-AIMK', type: 'Airbus A330-300' },
    schedule: {
      offBlockTime: new Date('2026-08-12T09:00:00.000Z'),
      takeoffTime: new Date('2026-08-12T09:20:00.000Z'),
      arrivalTime: new Date('2026-08-12T12:30:00.000Z'),
      onBlockTime: new Date('2026-08-12T12:40:00.000Z'),
    },
    weather: {
      atis: 'FRANKFURT INFORMATION K, RWY 25C, WIND 240/08',
      metar: 'METAR EDDF 121150Z 24008KT 9999 FEW035 22/13 Q1017 NOSIG',
      taf: 'TAF EDDF 121100Z 1212/1318 24010KT 9999 SCT035',
    },
    ofpDocumentUrl: OFP_URL,
    flightUrl: FLIGHT_URL,
    ...overrides,
  };
}

describe('formatFlightNumber', () => {
  it('separates the carrier code from the number', () => {
    expect(formatFlightNumber('LH55')).toBe('LH 55');
  });
});

describe('formatBlockTime', () => {
  it('reports hours and minutes between out and in', () => {
    expect(
      formatBlockTime(
        new Date('2026-08-12T09:00:00.000Z'),
        new Date('2026-08-12T12:40:00.000Z'),
      ),
    ).toBe('3h 40m');
  });

  it('pads a single-digit minute count', () => {
    expect(
      formatBlockTime(
        new Date('2026-08-12T09:00:00.000Z'),
        new Date('2026-08-12T10:05:00.000Z'),
      ),
    ).toBe('1h 05m');
  });
});

describe('formatFlightBriefing', () => {
  it('renders the complete briefing', () => {
    expect(formatFlightBriefing(briefing())).toBe(
      [
        ':clipboard: **Flight LH 55 briefing**',
        '',
        'Route: **Frankfurt (FRA)** to **Newark (EWR)**',
        'Aircraft: **D-AIMK** (Airbus A330-300)',
        '',
        'Estimated schedule:',
        '```',
        'out: 09:00z',
        'off: 09:20z',
        'on:  12:30z',
        'in:  12:40z',
        '',
        'block: 3h 40m',
        '```',
        '',
        'ATIS for FRA:',
        '```',
        'FRANKFURT INFORMATION K, RWY 25C, WIND 240/08',
        '```',
        '',
        'METAR:',
        '```',
        'METAR EDDF 121150Z 24008KT 9999 FEW035 22/13 Q1017 NOSIG',
        '```',
        '',
        'TAF:',
        '```',
        'TAF EDDF 121100Z 1212/1318 24010KT 9999 SCT035',
        '```',
        '',
        `[Operational flight plan](${OFP_URL})`,
        '',
        'Manage your flight in the <:ft:1436299102626386031> ' +
          `[**Flight Tracker app**](${FLIGHT_URL}).`,
      ].join('\n'),
    );
  });

  it('omits the ATIS section when no ATIS is published', () => {
    const content = formatFlightBriefing(
      briefing({ weather: { metar: 'METAR EDDF 121150Z', taf: 'TAF EDDF' } }),
    );

    expect(content).not.toContain('ATIS');
    expect(content).toContain('METAR:');
    expect(content).toContain('TAF:');
  });

  it('omits every weather section when nothing is held', () => {
    const content = formatFlightBriefing(briefing({ weather: {} }));

    expect(content).not.toContain('ATIS');
    expect(content).not.toContain('METAR');
    expect(content).not.toContain('TAF');
    expect(content).toContain('Estimated schedule:');
  });

  it('omits the flight plan link when the flight has none', () => {
    const content = formatFlightBriefing(briefing({ ofpDocumentUrl: null }));

    expect(content).not.toContain('Operational flight plan');
  });

  it('omits the schedule when the flight has no estimated times', () => {
    const content = formatFlightBriefing(briefing({ schedule: undefined }));

    expect(content).not.toContain('Estimated schedule:');
  });

  it('lists only the times the crew estimated', () => {
    const content = formatFlightBriefing(
      briefing({
        schedule: { offBlockTime: new Date('2026-08-12T09:00:00.000Z') },
      }),
    );

    expect(content).toContain('out: 09:00z');
    expect(content).not.toContain('off:');
    expect(content).not.toContain('block:');
  });

  it('always closes with the link to the flight', () => {
    expect(formatFlightBriefing(briefing())).toContain(
      `[**Flight Tracker app**](${FLIGHT_URL}).`,
    );
  });
});
