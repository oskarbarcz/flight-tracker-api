import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  airportOsmPullCacheKey,
  CACHE_TTL_MS,
} from '../../../../core/cache/cache.key';
import { OsmClient } from '../../../../core/provider/osm/client/osm.client';
import { OsmAirportData } from '../../../../core/provider/osm/type/osm.types';
import { Coordinates } from '../../model/airport.model';
import { CurrentAirportData } from '../../model/osm-upgrade.diff';
import { GatesRepository } from '../database/gates.repository';
import { ParkingPositionsRepository } from '../database/parking-positions.repository';
import { RunwaysRepository } from '../database/runways.repository';
import { TerminalsRepository } from '../database/terminals.repository';

export interface RetainedPull {
  data: OsmAirportData;
  pulledAt: string;
}

/** Values by reference name for the diff, ids by reference name for the write. */
export interface AirportSnapshot {
  current: CurrentAirportData;
  terminalIdByShortName: Map<string, string>;
  parkingPositionIdByName: Map<string, string>;
  runwayIdByDesignator: Map<string, string>;
  gateIdByName: Map<string, string>;
}

@Injectable()
export class OsmAirportDataService {
  private readonly logger = new Logger(OsmAirportDataService.name);

  constructor(
    private readonly osm: OsmClient,
    private readonly terminals: TerminalsRepository,
    private readonly parkingPositions: ParkingPositionsRepository,
    private readonly gates: GatesRepository,
    private readonly runways: RunwaysRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async retained(airportId: string): Promise<RetainedPull | null> {
    const retained = await this.cacheManager.get<RetainedPull>(
      airportOsmPullCacheKey(airportId),
    );

    return retained ?? null;
  }

  async pull(
    airportId: string,
    icaoCode: string,
    pulledAt: string,
  ): Promise<RetainedPull> {
    const data = await this.osm.pullAirport(icaoCode);
    const pull: RetainedPull = { data, pulledAt };

    await this.cacheManager.set(
      airportOsmPullCacheKey(airportId),
      pull,
      CACHE_TTL_MS.AIRPORT_OSM_PULL,
    );

    this.logger.log(
      `Retained an OpenStreetMap pull of ${icaoCode}: ` +
        `${data.runways.length} runways, ${data.terminals.length} terminals, ` +
        `${data.parkingPositions.length} parking positions, ${data.gates.length} gates.`,
    );

    return pull;
  }

  async snapshot(airportId: string): Promise<AirportSnapshot> {
    const [terminals, parkingPositions, gates, runways] = await Promise.all([
      this.terminals.findAll(airportId),
      this.parkingPositions.findAll(airportId),
      this.gates.findAll(airportId),
      this.runways.findAll(airportId),
    ]);

    const terminalNameById = new Map(
      terminals.map((terminal) => [terminal.id, terminal.shortName]),
    );
    const parkingPositionNameById = new Map(
      parkingPositions.map((position) => [position.id, position.name]),
    );

    const current: CurrentAirportData = {
      // Filled in by the caller, which already holds the airport it looked up.
      location: null,
      shape: null,
      runways: runways.map((runway) => ({
        designator: runway.designator,
        length: runway.length,
        width: runway.width,
        trueHeading: runway.trueHeading,
        elevation: runway.elevation,
        surfaceType: runway.surfaceType,
        coordinates: runway.coordinates as unknown as Coordinates,
      })),
      terminals: terminals.map((terminal) => ({
        shortName: terminal.shortName,
        shape: terminal.shape as unknown as Coordinates[] | null,
      })),
      parkingPositions: parkingPositions.map((position) => ({
        name: position.name,
        terminal: terminalNameById.get(position.terminalId) ?? null,
        location: position.location,
        coordinates: position.coordinates as unknown as Coordinates | null,
      })),
      gates: gates.map((gate) => ({
        name: gate.name,
        terminal: terminalNameById.get(gate.terminalId) ?? null,
        parkingPosition: gate.parkingPositionId
          ? (parkingPositionNameById.get(gate.parkingPositionId) ?? null)
          : null,
        coordinates: gate.coordinates as unknown as Coordinates | null,
      })),
    };

    return {
      current,
      terminalIdByShortName: new Map(
        terminals.map((terminal) => [terminal.shortName, terminal.id]),
      ),
      parkingPositionIdByName: new Map(
        parkingPositions.map((position) => [position.name, position.id]),
      ),
      runwayIdByDesignator: new Map(
        runways.map((runway) => [runway.designator, runway.id]),
      ),
      gateIdByName: new Map(gates.map((gate) => [gate.name, gate.id])),
    };
  }
}
