import {
  BriefingInput,
  calculateBlockTime,
  formatArrivalAnnouncement,
  formatBlockTime,
  formatBoardingAnnouncement,
  formatFlightBriefing,
  formatDelayAllocationRequest,
  formatDelayApproval,
  formatFlightNumber,
  formatLoadsheet,
} from './discord-message.formatter';

const OFP_URL = 'https://www.simbrief.com/ofp/flightplans/EDDFKEWR_PDF.pdf';
const FLIGHT_URL = 'https://flights.example.com/flight/flight-id';
const MAP_URL = 'https://flights.example.com/map/flight-id';
const DELAY_URL = 'https://flights.example.com/flight/flight-id/delay';
const EMOJI = '<:ft:1436299102626386031>';

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
    flightUrl: FLIGHT_URL,
    ...overrides,
  };
}

const route = {
  departure: { city: 'Frankfurt', iataCode: 'FRA' },
  destination: { city: 'Newark', iataCode: 'EWR' },
};

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

describe('calculateBlockTime', () => {
  it('reports the announcement block time as zero-padded hours and minutes', () => {
    expect(
      calculateBlockTime(
        new Date('2026-08-12T09:00:00.000Z'),
        new Date('2026-08-12T12:08:00.000Z'),
      ),
    ).toBe('03:08');
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
        `Manage your flight in the ${EMOJI} [**MyPreflight app**](${FLIGHT_URL}).`,
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

  it('never mentions the operational flight plan in the body', () => {
    const content = formatFlightBriefing(briefing());

    expect(content).not.toContain('Operational flight plan');
    expect(content).not.toContain(OFP_URL);
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
      `[**MyPreflight app**](${FLIGHT_URL}).`,
    );
  });
});

describe('formatBoardingAnnouncement', () => {
  it('renders the boarding announcement', () => {
    expect(
      formatBoardingAnnouncement({
        flightNumber: 'LH55',
        ...route,
        blockTime: '03:40',
        passengers: 293,
        flightUrl: MAP_URL,
      }),
    ).toBe(
      ':airplane_departure: :airplane_departure: :airplane_departure:\n\n' +
        'Flight **LH 55** from **Frankfurt (FRA)** to **Newark (EWR)**' +
        ' has started boarding!\n' +
        'Estimated block time: **03:40hrs**, Passengers on board: **293**\n\n' +
        `Track flight live on ${EMOJI} [MyPreflight](${MAP_URL})!`,
    );
  });
});

describe('formatArrivalAnnouncement', () => {
  it('renders the arrival announcement', () => {
    expect(
      formatArrivalAnnouncement({
        flightNumber: 'LH55',
        ...route,
        blockTime: '03:52',
        flightUrl: MAP_URL,
      }),
    ).toBe(
      ':airplane_arriving: :airplane_arriving: :airplane_arriving:\n\n' +
        'Flight **LH 55** from **Frankfurt (FRA)** to **Newark (EWR)**' +
        ' just arrived!\n' +
        'Actual block time: **03:52hrs**\n\n' +
        `See flight path on ${EMOJI} [MyPreflight](${MAP_URL})!`,
    );
  });
});

describe('formatLoadsheet', () => {
  const loadsheet = {
    flightCrew: { pilots: 2, reliefPilots: 1, cabinCrew: 4 },
    passengers: 200,
    cargo: 3.5,
    payload: 22.507,
    zeroFuelWeight: 189.507,
    blockFuel: 11.5,
  };
  const crew = [
    { name: 'Piotr Lewandowski', role: 'fo' },
    { name: 'Marek Zielinski', role: 'pu' },
    { name: 'Anna Nowak', role: 'fa' },
  ];

  it('renders the preliminary loadsheet', () => {
    expect(
      formatLoadsheet({
        kind: 'preliminary',
        flightNumber: 'LH55',
        crew,
        loadsheet,
        flightUrl: FLIGHT_URL,
      }),
    ).toBe(
      [
        ':clipboard: **Flight LH 55 preliminary loadsheet**',
        '',
        'Crew:',
        '```',
        'FO  Piotr Lewandowski',
        'PU  Marek Zielinski',
        'FA  Anna Nowak',
        '```',
        '',
        'Load:',
        '```',
        'crew:        2 + 1 relief, 4 cabin',
        'passengers:  200',
        'cargo:       3.5 t',
        'payload:     22.507 t',
        'zero fuel:   189.507 t',
        'block fuel:  11.5 t',
        '```',
        '',
        `Manage your flight in the ${EMOJI} [**MyPreflight app**](${FLIGHT_URL}).`,
      ].join('\n'),
    );
  });

  it('titles the final loadsheet as final', () => {
    const content = formatLoadsheet({
      kind: 'final',
      flightNumber: 'LH55',
      crew,
      loadsheet,
      flightUrl: FLIGHT_URL,
    });

    expect(content).toContain(':clipboard: **Flight LH 55 final loadsheet**');
    expect(content).not.toContain('preliminary');
  });

  it('omits the crew section when no crew is assigned', () => {
    const content = formatLoadsheet({
      kind: 'preliminary',
      flightNumber: 'LH55',
      crew: [],
      loadsheet,
      flightUrl: FLIGHT_URL,
    });

    expect(content).not.toContain('Crew:');
    expect(content).toContain('Load:');
    expect(content).toContain('passengers:  200');
  });
});

describe('formatDelayAllocationRequest', () => {
  it('states the delay and links to the allocation screen', () => {
    expect(
      formatDelayAllocationRequest({
        flightNumber: 'LH55',
        delayMinutes: 12,
        allocationUrl: DELAY_URL,
      }),
    ).toBe(
      [
        ':hourglass: **Flight LH 55 delay**',
        '',
        'A departure delay of **12 minutes** was recorded and has to be allocated.',
        '',
        `Allocate it in the ${EMOJI} [**MyPreflight app**](${DELAY_URL}).`,
      ].join('\n'),
    );
  });
});

describe('formatDelayApproval', () => {
  it('confirms the approval', () => {
    expect(
      formatDelayApproval({ flightNumber: 'LH55', flightUrl: DELAY_URL }),
    ).toBe(
      [
        ':white_check_mark: **Flight LH 55 delay approved**',
        '',
        'Operations approved your delay allocation.',
        '',
        `Manage your flight in the ${EMOJI} [**MyPreflight app**](${DELAY_URL}).`,
      ].join('\n'),
    );
  });
});
