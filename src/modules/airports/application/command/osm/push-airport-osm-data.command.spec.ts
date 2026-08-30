import {
  OsmAirportData,
  OsmRunway,
} from '../../../../../core/provider/osm/type/osm.types';
import { AirportSnapshot } from '../../../infra/service/osm-airport-data.service';
import { DataQuality } from '../../../model/airport.model';
import { CurrentAirportData } from '../../../model/osm-upgrade.diff';
import { PushOutcome } from '../../../model/osm-upgrade.model';
import {
  PushAirportOsmDataCommand,
  PushAirportOsmDataHandler,
} from './push-airport-osm-data.command';

const AIRPORT_ID = '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf';
const LOCATION = { longitude: 8.786667, latitude: 53.0475 };

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
    coordinates: LOCATION,
    ...overrides,
  };
}

const OSM_DATA: OsmAirportData = {
  icaoCode: 'EDDW',
  name: 'Bremen Airport',
  source: 'OpenStreetMap via Overpass',
  runways: [osmRunway(), osmRunway({ designator: '27', length: 2100 })],
  terminals: [],
  parkingPositions: [],
  gates: [
    {
      name: '6',
      category: 'schengen',
      terminal: 'HT',
      parkingPosition: '06',
      coordinates: LOCATION,
    },
  ],
};

const CURRENT: CurrentAirportData = {
  location: LOCATION,
  shape: null,
  runways: [
    {
      designator: '09',
      length: 2000,
      width: 45,
      trueHeading: 88,
      elevation: 4,
      surfaceType: 'asphalt',
      coordinates: LOCATION,
    },
    {
      designator: '27',
      length: 2000,
      width: 45,
      trueHeading: 88,
      elevation: 4,
      surfaceType: 'asphalt',
      coordinates: LOCATION,
    },
  ],
  terminals: [],
  parkingPositions: [],
  gates: [],
};

describe('PushAirportOsmDataHandler', () => {
  let airportsRepository: { findById: jest.Mock; update: jest.Mock };
  let runwaysRepository: { update: jest.Mock; create: jest.Mock };
  let osmAirportData: { retained: jest.Mock; snapshot: jest.Mock };
  let handler: PushAirportOsmDataHandler;

  beforeEach(() => {
    const snapshot: AirportSnapshot = {
      current: CURRENT,
      terminalIdByShortName: new Map(),
      parkingPositionIdByName: new Map(),
      runwayIdByDesignator: new Map([
        ['09', 'ea2c1a55-0cd1-4d63-9d3f-5b7c1f9d2a01'],
        ['27', 'ea2c1a55-0cd1-4d63-9d3f-5b7c1f9d2a02'],
      ]),
      gateIdByName: new Map(),
    };

    airportsRepository = {
      findById: jest.fn().mockResolvedValue({
        id: AIRPORT_ID,
        icaoCode: 'EDDW',
        location: LOCATION,
        shape: null,
        dataQuality: DataQuality.Low,
      }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    runwaysRepository = {
      update: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(undefined),
    };
    osmAirportData = {
      retained: jest.fn().mockResolvedValue({
        data: OSM_DATA,
        pulledAt: '2026-08-30T10:00:00.000Z',
      }),
      snapshot: jest.fn().mockResolvedValue(snapshot),
    };

    handler = new PushAirportOsmDataHandler(
      airportsRepository as never,
      {} as never,
      {} as never,
      {} as never,
      runwaysRepository as never,
      osmAirportData as never,
    );
  });

  it('grades the airport flagship when a change lands', async () => {
    const result = await handler.execute(
      new PushAirportOsmDataCommand(AIRPORT_ID, ['runway:27']),
    );

    expect(result.totals.updated).toBe(1);
    expect(airportsRepository.update).toHaveBeenCalledTimes(1);
    expect(airportsRepository.update).toHaveBeenCalledWith(AIRPORT_ID, {
      dataQuality: DataQuality.Flagship,
    });
  });

  it('leaves the grade alone when every change is skipped', async () => {
    const result = await handler.execute(
      new PushAirportOsmDataCommand(AIRPORT_ID, ['runway:09']),
    );

    expect(result.totals).toEqual({
      added: 0,
      removed: 0,
      updated: 0,
      skipped: 1,
      failed: 0,
    });
    expect(airportsRepository.update).not.toHaveBeenCalled();
  });

  it('leaves the grade alone when every change fails', async () => {
    const result = await handler.execute(
      new PushAirportOsmDataCommand(AIRPORT_ID, ['gate:6']),
    );

    expect(result.changes).toEqual([
      {
        key: 'gate:6',
        outcome: PushOutcome.Failed,
        reason:
          'Requires terminal HT, which does not exist and was not pushed alongside it.',
      },
    ]);
    expect(airportsRepository.update).not.toHaveBeenCalled();
  });
});
