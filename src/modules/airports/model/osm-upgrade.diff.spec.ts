import {
  OsmAirportData,
  OsmGate,
  OsmParkingPosition,
  OsmRunway,
  OsmTerminal,
} from '../../../core/provider/osm/type/osm.types';
import { Coordinates } from './airport.model';
import {
  buildProposal,
  CurrentAirportData,
  inApplyOrder,
  summarize,
} from './osm-upgrade.diff';
import {
  ProposedStatus,
  ProposedChange,
  ProposedResource,
} from './osm-upgrade.model';

const at = (longitude: number, latitude: number): Coordinates => ({
  longitude,
  latitude,
});

const RING = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];

function osmRunway(overrides: Partial<OsmRunway> = {}): OsmRunway {
  return {
    designator: '09',
    length: 2000,
    width: 45,
    magneticHeading: 90,
    trueHeading: 88,
    elevation: 4,
    surfaceType: 'asphalt',
    lightingType: 'unknown',
    coordinates: at(8.77, 53.04),
    ...overrides,
  };
}

function osmTerminal(overrides: Partial<OsmTerminal> = {}): OsmTerminal {
  return {
    shortName: 'HT',
    fullName: 'Hauptterminal',
    averageTaxiTime: 0,
    operatorCodes: [],
    shape: RING,
    ...overrides,
  };
}

function osmStand(
  overrides: Partial<OsmParkingPosition> = {},
): OsmParkingPosition {
  return {
    name: '05',
    terminal: 'HT',
    bridge: 'no',
    stairs: 'no',
    deicing: 'no',
    gpu: 'no',
    pca: 'no',
    type: 'straight-in',
    spotType: 'other',
    assistance: 'none',
    location: 'remote',
    noiseSensitivity: 'no',
    fuelingOptions: 'none',
    coordinates: at(8.78, 53.05),
    ...overrides,
  };
}

function osmGate(overrides: Partial<OsmGate> = {}): OsmGate {
  return {
    name: '5',
    category: 'international',
    terminal: 'HT',
    parkingPosition: '05',
    coordinates: at(8.78, 53.05),
    ...overrides,
  };
}

function osm(overrides: Partial<OsmAirportData> = {}): OsmAirportData {
  return {
    icaoCode: 'EDDW',
    name: 'Bremen',
    source: 'OpenStreetMap via Overpass',
    runways: [],
    terminals: [],
    parkingPositions: [],
    gates: [],
    ...overrides,
  };
}

function current(
  overrides: Partial<CurrentAirportData> = {},
): CurrentAirportData {
  return {
    location: null,
    shape: null,
    runways: [],
    terminals: [],
    parkingPositions: [],
    gates: [],
    ...overrides,
  };
}

function change(changes: ProposedChange[], key: string): ProposedChange {
  const found = changes.find((entry) => entry.key === key);

  expect(found).toBeDefined();

  return found as ProposedChange;
}

function fields(changes: ProposedChange[], key: string): string[] {
  return change(changes, key)
    .fields.map((field) => field.field)
    .sort();
}

describe('the airport itself', () => {
  it('reports a location OpenStreetMap agrees with as unchanged', () => {
    const changes = buildProposal(
      osm({ location: at(8.78, 53.04) }),
      current({ location: at(8.78, 53.04) }),
    );

    expect(change(changes, 'airport:location').status).toBe(
      ProposedStatus.NotChanged,
    );
  });

  it('reports a location that moved as an update, with both values', () => {
    const changes = buildProposal(
      osm({ location: at(8.79, 53.04) }),
      current({ location: at(8.78, 53.04) }),
    );

    expect(change(changes, 'airport:location')).toMatchObject({
      status: ProposedStatus.Updated,
      fields: [
        {
          field: 'location',
          current: at(8.78, 53.04),
          proposed: at(8.79, 53.04),
        },
      ],
    });
  });

  it('proposes a boundary the airport has never had', () => {
    const changes = buildProposal(osm({ shape: RING }), current());

    expect(change(changes, 'airport:shape')).toMatchObject({
      status: ProposedStatus.Updated,
      fields: [{ field: 'shape', current: null, proposed: RING }],
    });
  });

  it('ignores a boundary wound the other way round', () => {
    const changes = buildProposal(
      osm({ shape: [...RING].reverse() }),
      current({ shape: RING }),
    );

    expect(change(changes, 'airport:shape').status).toBe(
      ProposedStatus.NotChanged,
    );
  });

  it('spots a boundary that gained a point', () => {
    const changes = buildProposal(
      osm({ shape: [...RING, at(0.5, 0.5)] }),
      current({ shape: RING }),
    );

    expect(change(changes, 'airport:shape').status).toBe(
      ProposedStatus.Updated,
    );
  });
});

describe('runways', () => {
  const existing = {
    designator: '09',
    length: 2000,
    width: 45,
    trueHeading: 88,
    elevation: 4,
    surfaceType: 'asphalt',
    coordinates: at(8.77, 53.04),
  };

  it('proposes a runway the airport does not have, with every field it would write', () => {
    const changes = buildProposal(osm({ runways: [osmRunway()] }), current());

    expect(change(changes, 'runway:09').status).toBe(ProposedStatus.Added);
    expect(fields(changes, 'runway:09')).toEqual([
      'coordinates',
      'designator',
      'elevation',
      'length',
      'lightingType',
      'magneticHeading',
      'surfaceType',
      'trueHeading',
      'width',
    ]);
  });

  it('reports a runway it agrees with as unchanged', () => {
    const changes = buildProposal(
      osm({ runways: [osmRunway()] }),
      current({ runways: [existing] }),
    );

    expect(change(changes, 'runway:09').status).toBe(ProposedStatus.NotChanged);
  });

  it.each([
    ['length', { length: 2200 }],
    ['width', { width: 60 }],
    ['trueHeading', { trueHeading: 91 }],
    ['elevation', { elevation: 7 }],
    ['coordinates', { coordinates: at(8.78, 53.04) }],
  ])('proposes only the changed %s', (field, override) => {
    const changes = buildProposal(
      osm({ runways: [osmRunway(override)] }),
      current({ runways: [existing] }),
    );

    expect(fields(changes, 'runway:09')).toEqual([field]);
  });

  it('never proposes a magnetic heading, which the provider derives from the designator', () => {
    // 09 always yields 90, so patching it would replace a surveyed value with
    // a rounded one.
    const changes = buildProposal(
      osm({ runways: [osmRunway({ magneticHeading: 90 })] }),
      current({ runways: [existing] }),
    );

    expect(change(changes, 'runway:09').status).toBe(ProposedStatus.NotChanged);
  });

  it('never proposes lighting, which OpenStreetMap does not hold', () => {
    const changes = buildProposal(
      osm({ runways: [osmRunway({ lightingType: 'unknown' })] }),
      current({ runways: [existing] }),
    );

    expect(fields(changes, 'runway:09')).toEqual([]);
  });

  it('does not overwrite a known surface with an unsurveyed one', () => {
    const changes = buildProposal(
      osm({ runways: [osmRunway({ surfaceType: 'unknown' })] }),
      current({ runways: [existing] }),
    );

    expect(change(changes, 'runway:09').status).toBe(ProposedStatus.NotChanged);
  });

  it('does propose a surface OpenStreetMap has surveyed', () => {
    const changes = buildProposal(
      osm({ runways: [osmRunway({ surfaceType: 'concrete' })] }),
      current({ runways: [existing] }),
    );

    expect(fields(changes, 'runway:09')).toEqual(['surfaceType']);
  });

  it('leaves an elevation alone when OpenStreetMap has none', () => {
    const runway = osmRunway();
    delete runway.elevation;

    const changes = buildProposal(
      osm({ runways: [runway] }),
      current({ runways: [existing] }),
    );

    expect(change(changes, 'runway:09').status).toBe(ProposedStatus.NotChanged);
  });
});

describe('terminals', () => {
  it('proposes a terminal the airport does not have', () => {
    const changes = buildProposal(
      osm({ terminals: [osmTerminal()] }),
      current(),
    );

    expect(change(changes, 'terminal:HT').status).toBe(ProposedStatus.Added);
    expect(fields(changes, 'terminal:HT')).toEqual([
      'averageTaxiTime',
      'fullName',
      'operatorCodes',
      'shape',
      'shortName',
      'text',
    ]);
  });

  it('proposes only the footprint for a terminal that exists', () => {
    const changes = buildProposal(
      osm({
        terminals: [osmTerminal({ shape: [at(2, 2), at(3, 2), at(3, 3)] })],
      }),
      current({ terminals: [{ shortName: 'HT', shape: RING }] }),
    );

    expect(fields(changes, 'terminal:HT')).toEqual(['shape']);
  });

  it('never proposes a curated name, taxi time or operator list', () => {
    const changes = buildProposal(
      osm({
        terminals: [
          osmTerminal({
            fullName: 'Terminal',
            averageTaxiTime: 0,
            operatorCodes: [],
            shape: RING,
          }),
        ],
      }),
      current({ terminals: [{ shortName: 'HT', shape: RING }] }),
    );

    expect(change(changes, 'terminal:HT').status).toBe(
      ProposedStatus.NotChanged,
    );
  });
});

describe('parking positions', () => {
  const existing = {
    name: '05',
    terminal: 'HT',
    location: 'remote',
    coordinates: at(8.78, 53.05),
  };

  it('needs its terminal when the airport has none by that name', () => {
    const changes = buildProposal(
      osm({ terminals: [osmTerminal()], parkingPositions: [osmStand()] }),
      current(),
    );

    expect(change(changes, 'parkingPosition:05')).toMatchObject({
      status: ProposedStatus.Added,
      requires: ['terminal:HT'],
    });
  });

  it('needs nothing when its terminal is already there', () => {
    const changes = buildProposal(
      osm({ parkingPositions: [osmStand()] }),
      current({ terminals: [{ shortName: 'HT', shape: null }] }),
    );

    expect(change(changes, 'parkingPosition:05').requires).toEqual([]);
  });

  it('proposes moving a stand to another terminal', () => {
    const changes = buildProposal(
      osm({ parkingPositions: [osmStand({ terminal: 'NT' })] }),
      current({
        terminals: [
          { shortName: 'HT', shape: null },
          { shortName: 'NT', shape: null },
        ],
        parkingPositions: [existing],
      }),
    );

    expect(change(changes, 'parkingPosition:05')).toMatchObject({
      fields: [{ field: 'terminal', current: 'HT', proposed: 'NT' }],
      requires: [],
    });
  });

  it('promotes a remote stand once a gate boards onto it', () => {
    const changes = buildProposal(
      osm({ parkingPositions: [osmStand({ location: 'gate' })] }),
      current({
        terminals: [{ shortName: 'HT', shape: null }],
        parkingPositions: [existing],
      }),
    );

    expect(fields(changes, 'parkingPosition:05')).toEqual(['location']);
  });

  it('never demotes a stand back to remote', () => {
    // OpenStreetMap saying `remote` means it mapped no gate within reach, which
    // is silence rather than evidence the jet bridge went away.
    const changes = buildProposal(
      osm({ parkingPositions: [osmStand({ location: 'remote' })] }),
      current({
        terminals: [{ shortName: 'HT', shape: null }],
        parkingPositions: [{ ...existing, location: 'gate' }],
      }),
    );

    expect(change(changes, 'parkingPosition:05').status).toBe(
      ProposedStatus.NotChanged,
    );
  });
});

describe('gates', () => {
  const existing = {
    name: '5',
    terminal: 'HT',
    parkingPosition: '05',
    coordinates: at(8.78, 53.05),
  };

  it('needs both its terminal and its stand when neither is there', () => {
    const changes = buildProposal(
      osm({
        terminals: [osmTerminal()],
        parkingPositions: [osmStand()],
        gates: [osmGate()],
      }),
      current(),
    );

    expect(change(changes, 'gate:5').requires).toEqual([
      'terminal:HT',
      'parkingPosition:05',
    ]);
  });

  it('needs only what is missing', () => {
    const changes = buildProposal(
      osm({ parkingPositions: [osmStand()], gates: [osmGate()] }),
      current({ terminals: [{ shortName: 'HT', shape: null }] }),
    );

    expect(change(changes, 'gate:5').requires).toEqual(['parkingPosition:05']);
  });

  it('proposes a stand link the gate does not have yet', () => {
    const changes = buildProposal(
      osm({ gates: [osmGate({ parkingPosition: '06' })] }),
      current({
        terminals: [{ shortName: 'HT', shape: null }],
        parkingPositions: [
          { name: '06', terminal: 'HT', location: 'gate', coordinates: null },
        ],
        gates: [{ ...existing, parkingPosition: null }],
      }),
    );

    expect(change(changes, 'gate:5')).toMatchObject({
      fields: [{ field: 'parkingPosition', current: null, proposed: '06' }],
      requires: [],
    });
  });

  it('never unlinks a gate OpenStreetMap found no stand for', () => {
    const changes = buildProposal(
      osm({ gates: [osmGate({ parkingPosition: null })] }),
      current({
        terminals: [{ shortName: 'HT', shape: null }],
        gates: [existing],
      }),
    );

    expect(change(changes, 'gate:5').status).toBe(ProposedStatus.NotChanged);
  });
});

describe('records OpenStreetMap no longer reports', () => {
  const runway = {
    designator: '18',
    length: 1,
    width: 1,
    trueHeading: null,
    elevation: null,
    surfaceType: 'asphalt',
    coordinates: at(0, 0),
  };

  it('reports a runway as removed, with nothing to write', () => {
    const changes = buildProposal(osm(), current({ runways: [runway] }));

    expect(change(changes, 'runway:18')).toMatchObject({
      status: ProposedStatus.Removed,
      fields: [],
      requires: [],
    });
  });

  it('reports a boundary the airport has but OpenStreetMap does not', () => {
    const changes = buildProposal(
      osm({ location: at(0, 0) }),
      current({ location: at(0, 0), shape: RING }),
    );

    expect(change(changes, 'airport:shape').status).toBe(
      ProposedStatus.Removed,
    );
  });

  it('never reports a location as removed, since the airport must have one', () => {
    const changes = buildProposal(osm(), current({ location: at(0, 0) }));

    expect(changes).toEqual([]);
  });

  it('reports a terminal as removed, naming what has to go first', () => {
    const changes = buildProposal(
      osm(),
      current({
        terminals: [{ shortName: 'X', shape: null }],
        parkingPositions: [
          { name: 'X1', terminal: 'X', location: 'gate', coordinates: null },
        ],
        gates: [
          {
            name: 'X1',
            terminal: 'X',
            parkingPosition: 'X1',
            coordinates: null,
          },
        ],
      }),
    );

    expect(change(changes, 'terminal:X')).toMatchObject({
      status: ProposedStatus.Removed,
      requires: ['parkingPosition:X1', 'gate:X1'],
    });
  });

  it('reports a stand as removed, naming the gates boarding onto it', () => {
    const changes = buildProposal(
      osm({ terminals: [osmTerminal({ shortName: 'X', shape: undefined })] }),
      current({
        terminals: [{ shortName: 'X', shape: null }],
        parkingPositions: [
          { name: 'X1', terminal: 'X', location: 'gate', coordinates: null },
        ],
        gates: [
          {
            name: 'G1',
            terminal: 'X',
            parkingPosition: 'X1',
            coordinates: null,
          },
        ],
      }),
    );

    expect(change(changes, 'parkingPosition:X1')).toMatchObject({
      status: ProposedStatus.Removed,
      requires: ['gate:G1'],
    });
  });

  it('reports a gate as removed with nothing depending on it', () => {
    const changes = buildProposal(
      osm(),
      current({
        gates: [
          {
            name: 'G1',
            terminal: 'X',
            parkingPosition: null,
            coordinates: null,
          },
        ],
      }),
    );

    expect(change(changes, 'gate:G1')).toMatchObject({
      status: ProposedStatus.Removed,
      requires: [],
    });
  });

  it('says nothing at all when the airport and OpenStreetMap are both empty', () => {
    expect(buildProposal(osm(), current())).toEqual([]);
  });
});

describe('summarize', () => {
  it('counts each action', () => {
    const changes = buildProposal(
      osm({
        location: at(0, 0),
        shape: RING,
        runways: [osmRunway(), osmRunway({ designator: '27' })],
        terminals: [osmTerminal()],
      }),
      current({
        location: at(0, 0),
        runways: [
          {
            designator: '09',
            length: 2000,
            width: 45,
            trueHeading: 88,
            elevation: 4,
            surfaceType: 'asphalt',
            coordinates: at(8.77, 53.04),
          },
        ],
      }),
    );

    expect(summarize(changes)).toEqual({
      added: 2,
      removed: 0,
      updated: 1,
      notChanged: 2,
    });
  });
});

describe('inApplyOrder', () => {
  it('empties a terminal before removing it, and removes before it writes', () => {
    const changes = buildProposal(
      osm(),
      current({
        terminals: [{ shortName: 'X', shape: null }],
        parkingPositions: [
          { name: 'X1', terminal: 'X', location: 'gate', coordinates: null },
        ],
        gates: [
          {
            name: 'G1',
            terminal: 'X',
            parkingPosition: 'X1',
            coordinates: null,
          },
        ],
        runways: [
          {
            designator: '18',
            length: 1,
            width: 1,
            trueHeading: null,
            elevation: null,
            surfaceType: 'asphalt',
            coordinates: at(0, 0),
          },
        ],
      }),
    );

    expect(inApplyOrder(changes).map((entry) => entry.key)).toEqual([
      'gate:G1',
      'parkingPosition:X1',
      'terminal:X',
      'runway:18',
    ]);
  });

  it('runs every removal before any write', () => {
    const changes = buildProposal(
      osm({ terminals: [osmTerminal()] }),
      current({
        gates: [
          {
            name: 'G1',
            terminal: 'X',
            parkingPosition: null,
            coordinates: null,
          },
        ],
      }),
    );

    expect(inApplyOrder(changes).map((entry) => entry.key)).toEqual([
      'gate:G1',
      'terminal:HT',
    ]);
  });

  it('puts terminals before the stands that hang off them, and stands before their gates', () => {
    const changes = buildProposal(
      osm({
        location: at(0, 0),
        runways: [osmRunway()],
        terminals: [osmTerminal()],
        parkingPositions: [osmStand()],
        gates: [osmGate()],
      }),
      current(),
    );

    expect(inApplyOrder(changes).map((entry) => entry.resource)).toEqual([
      ProposedResource.Terminal,
      ProposedResource.ParkingPosition,
      ProposedResource.Gate,
      ProposedResource.Runway,
      ProposedResource.Airport,
    ]);
  });

  it('leaves the proposal it was given untouched', () => {
    const changes = buildProposal(
      osm({ location: at(0, 0), terminals: [osmTerminal()] }),
      current(),
    );
    const before = changes.map((entry) => entry.key);

    inApplyOrder(changes);

    expect(changes.map((entry) => entry.key)).toEqual(before);
  });
});
