import {
  OsmAirportData,
  OsmCoordinates,
  OsmGate,
  OsmParkingPosition,
  OsmRunway,
  OsmTerminal,
} from '../../../core/provider/osm/type/osm.types';
import { Coordinates } from './airport.model';
import {
  ProposedChange,
  ProposedFieldChange,
  ProposedResource,
  ProposedStatus,
} from './osm-upgrade.model';

export interface CurrentRunway {
  designator: string;
  length: number;
  width: number;
  trueHeading: number | null;
  elevation: number | null;
  surfaceType: string;
  coordinates: Coordinates;
}

export interface CurrentTerminal {
  shortName: string;
  shape: Coordinates[] | null;
}

/** Linked by name, not id: OpenStreetMap references them that way. */
export interface CurrentParkingPosition {
  name: string;
  terminal: string | null;
  location: string;
  coordinates: Coordinates | null;
}

export interface CurrentGate {
  name: string;
  terminal: string | null;
  parkingPosition: string | null;
  coordinates: Coordinates | null;
}

export interface CurrentAirportData {
  location: Coordinates | null;
  shape: Coordinates[] | null;
  runways: CurrentRunway[];
  terminals: CurrentTerminal[];
  parkingPositions: CurrentParkingPosition[];
  gates: CurrentGate[];
}

const CHANGE_KEY_SEPARATOR = ':';

export function changeKey(resource: ProposedResource, label: string): string {
  return `${resource}${CHANGE_KEY_SEPARATOR}${label}`;
}

function coordinatesEqual(
  a: Coordinates | OsmCoordinates | null | undefined,
  b: Coordinates | OsmCoordinates | null | undefined,
): boolean {
  if (a == null || b == null) {
    return a == null && b == null;
  }

  return a.longitude === b.longitude && a.latitude === b.latitude;
}

function pointKey(point: Coordinates | OsmCoordinates): string {
  return `${point.longitude},${point.latitude}`;
}

/**
 * Rings are compared as sets of points. OpenStreetMap is free to wind a way the
 * other way round or start it at a different node without the boundary having
 * moved, and reporting that as a change would bury the real ones.
 */
function shapesEqual(
  a: (Coordinates | OsmCoordinates)[] | null | undefined,
  b: (Coordinates | OsmCoordinates)[] | null | undefined,
): boolean {
  if (a == null || b == null) {
    return a == null && b == null;
  }

  if (a.length !== b.length) {
    return false;
  }

  const left = a.map(pointKey).sort();
  const right = b.map(pointKey).sort();

  return left.every((point, index) => point === right[index]);
}

function changed(
  field: string,
  current: unknown,
  proposed: unknown,
  equal: (a: unknown, b: unknown) => boolean = (a, b) => a === b,
): ProposedFieldChange | null {
  if (equal(current, proposed)) {
    return null;
  }

  return { field, current: current ?? null, proposed };
}

function addition(
  resource: ProposedResource,
  label: string,
  record: Record<string, unknown>,
  requires: string[] = [],
): ProposedChange {
  return {
    key: changeKey(resource, label),
    resource,
    label,
    status: ProposedStatus.Added,
    fields: Object.entries(record).map(([field, proposed]) => ({
      field,
      current: null,
      proposed,
    })),
    requires,
  };
}

function removal(
  resource: ProposedResource,
  label: string,
  requires: string[] = [],
): ProposedChange {
  return {
    key: changeKey(resource, label),
    resource,
    label,
    status: ProposedStatus.Removed,
    fields: [],
    requires,
  };
}

function comparison(
  resource: ProposedResource,
  label: string,
  fields: (ProposedFieldChange | null)[],
  requires: string[] = [],
): ProposedChange {
  const present = fields.filter(
    (field): field is ProposedFieldChange => field !== null,
  );

  return {
    key: changeKey(resource, label),
    resource,
    label,
    status: present.length ? ProposedStatus.Updated : ProposedStatus.NotChanged,
    fields: present,
    requires: present.length ? requires : [],
  };
}

function airportChanges(
  osm: OsmAirportData,
  current: CurrentAirportData,
): ProposedChange[] {
  const changes: ProposedChange[] = [];

  if (osm.location) {
    changes.push(
      comparison(ProposedResource.Airport, 'location', [
        changed('location', current.location, osm.location, (a, b) =>
          coordinatesEqual(a as Coordinates, b as Coordinates),
        ),
      ]),
    );
  }

  if (osm.shape) {
    changes.push(
      comparison(ProposedResource.Airport, 'shape', [
        changed('shape', current.shape, osm.shape, (a, b) =>
          shapesEqual(a as Coordinates[], b as Coordinates[]),
        ),
      ]),
    );
  } else if (current.shape) {
    changes.push(removal(ProposedResource.Airport, 'shape'));
  }

  // A location is never removed: the airport model requires one, and an
  // aerodrome OpenStreetMap cannot place is one it does not hold at all.

  return changes;
}

/**
 * `magneticHeading` and `lightingType` are written when a runway is created and
 * never diffed afterwards. OpenStreetMap does not hold either: the provider
 * derives the magnetic heading from the designator (its number times ten), which
 * is coarser than a curated value, and it reports lighting as `unknown` always.
 * Patching them would replace real data with a placeholder.
 */
function runwayChanges(
  osm: OsmRunway[],
  current: CurrentRunway[],
): ProposedChange[] {
  const byDesignator = new Map(
    current.map((runway) => [runway.designator, runway]),
  );
  const reported = new Set(osm.map((runway) => runway.designator));

  const compared = osm.map((runway) => {
    const existing = byDesignator.get(runway.designator);

    if (!existing) {
      return addition(ProposedResource.Runway, runway.designator, {
        designator: runway.designator,
        length: runway.length,
        width: runway.width,
        magneticHeading: runway.magneticHeading,
        trueHeading: runway.trueHeading,
        elevation: runway.elevation ?? null,
        surfaceType: runway.surfaceType,
        lightingType: runway.lightingType,
        coordinates: runway.coordinates,
      });
    }

    return comparison(ProposedResource.Runway, runway.designator, [
      changed('length', existing.length, runway.length),
      changed('width', existing.width, runway.width),
      changed('trueHeading', existing.trueHeading, runway.trueHeading),
      runway.elevation === undefined
        ? null
        : changed('elevation', existing.elevation, runway.elevation),
      // OpenStreetMap answers `unknown` for a surface nobody has surveyed, which
      // must not overwrite a surface somebody has.
      runway.surfaceType === 'unknown'
        ? null
        : changed('surfaceType', existing.surfaceType, runway.surfaceType),
      changed('coordinates', existing.coordinates, runway.coordinates, (a, b) =>
        coordinatesEqual(a as Coordinates, b as Coordinates),
      ),
    ]);
  });

  const gone = current
    .filter((runway) => !reported.has(runway.designator))
    .map((runway) => removal(ProposedResource.Runway, runway.designator));

  return [...compared, ...gone];
}

/**
 * Only the footprint is diffed. Name, taxi time, operators and notes are curated
 * values that OpenStreetMap has nothing better than a placeholder for.
 */
function terminalChanges(
  osm: OsmTerminal[],
  current: CurrentAirportData,
): ProposedChange[] {
  const byShortName = new Map(
    current.terminals.map((terminal) => [terminal.shortName, terminal]),
  );
  const reported = new Set(osm.map((terminal) => terminal.shortName));

  const compared = osm.map((terminal) => {
    const existing = byShortName.get(terminal.shortName);

    if (!existing) {
      return addition(ProposedResource.Terminal, terminal.shortName, {
        shortName: terminal.shortName,
        fullName: terminal.fullName,
        averageTaxiTime: terminal.averageTaxiTime,
        operatorCodes: terminal.operatorCodes,
        text: terminal.text ?? null,
        shape: terminal.shape ?? null,
      });
    }

    return comparison(ProposedResource.Terminal, terminal.shortName, [
      terminal.shape === undefined
        ? null
        : changed('shape', existing.shape, terminal.shape, (a, b) =>
            shapesEqual(a as Coordinates[], b as Coordinates[]),
          ),
    ]);
  });

  const gone = current.terminals
    .filter((terminal) => !reported.has(terminal.shortName))
    .map((terminal) =>
      removal(ProposedResource.Terminal, terminal.shortName, [
        ...current.parkingPositions
          .filter((position) => position.terminal === terminal.shortName)
          .map((position) =>
            changeKey(ProposedResource.ParkingPosition, position.name),
          ),
        ...current.gates
          .filter((gate) => gate.terminal === terminal.shortName)
          .map((gate) => changeKey(ProposedResource.Gate, gate.name)),
      ]),
    );

  return [...compared, ...gone];
}

function parkingPositionChanges(
  osm: OsmParkingPosition[],
  current: CurrentAirportData,
): ProposedChange[] {
  const byName = new Map(
    current.parkingPositions.map((position) => [position.name, position]),
  );
  const terminals = new Set(
    current.terminals.map((terminal) => terminal.shortName),
  );
  const reported = new Set(osm.map((position) => position.name));

  const compared = osm.map((position) => {
    const existing = byName.get(position.name);
    const requires = terminals.has(position.terminal)
      ? []
      : [changeKey(ProposedResource.Terminal, position.terminal)];

    if (!existing) {
      return addition(
        ProposedResource.ParkingPosition,
        position.name,
        {
          name: position.name,
          terminal: position.terminal,
          bridge: position.bridge,
          stairs: position.stairs,
          deicing: position.deicing,
          gpu: position.gpu,
          pca: position.pca,
          type: position.type,
          spotType: position.spotType,
          assistance: position.assistance,
          location: position.location,
          noiseSensitivity: position.noiseSensitivity,
          fuelingOptions: position.fuelingOptions,
          coordinates: position.coordinates,
        },
        requires,
      );
    }

    return comparison(
      ProposedResource.ParkingPosition,
      position.name,
      [
        changed('terminal', existing.terminal, position.terminal),
        // A stand only ever gains a jet bridge here. OpenStreetMap says `gate`
        // when it found a gate boarding onto the stand and `remote` when it did
        // not — and "did not" is silence, not evidence of a remote stand.
        position.location === 'gate' && existing.location !== 'gate'
          ? changed('location', existing.location, position.location)
          : null,
        changed(
          'coordinates',
          existing.coordinates,
          position.coordinates,
          (a, b) => coordinatesEqual(a as Coordinates, b as Coordinates),
        ),
      ],
      requires,
    );
  });

  const gone = current.parkingPositions
    .filter((position) => !reported.has(position.name))
    .map((position) =>
      removal(
        ProposedResource.ParkingPosition,
        position.name,
        current.gates
          .filter((gate) => gate.parkingPosition === position.name)
          .map((gate) => changeKey(ProposedResource.Gate, gate.name)),
      ),
    );

  return [...compared, ...gone];
}

function gateChanges(
  osm: OsmGate[],
  current: CurrentAirportData,
): ProposedChange[] {
  const byName = new Map(current.gates.map((gate) => [gate.name, gate]));
  const terminals = new Set(
    current.terminals.map((terminal) => terminal.shortName),
  );
  const positions = new Set(
    current.parkingPositions.map((position) => position.name),
  );
  const reported = new Set(osm.map((gate) => gate.name));

  const compared = osm.map((gate) => {
    const existing = byName.get(gate.name);

    const requires = [
      terminals.has(gate.terminal)
        ? null
        : changeKey(ProposedResource.Terminal, gate.terminal),
      gate.parkingPosition && !positions.has(gate.parkingPosition)
        ? changeKey(ProposedResource.ParkingPosition, gate.parkingPosition)
        : null,
    ].filter((key): key is string => key !== null);

    if (!existing) {
      return addition(
        ProposedResource.Gate,
        gate.name,
        {
          name: gate.name,
          category: gate.category,
          terminal: gate.terminal,
          parkingPosition: gate.parkingPosition,
          coordinates: gate.coordinates,
        },
        requires,
      );
    }

    return comparison(
      ProposedResource.Gate,
      gate.name,
      [
        changed('terminal', existing.terminal, gate.terminal),
        // A gate never loses its stand from a pull: OpenStreetMap linking
        // nothing means it mapped no stand within reach, not that the curated
        // link is wrong.
        gate.parkingPosition === null
          ? null
          : changed(
              'parkingPosition',
              existing.parkingPosition,
              gate.parkingPosition,
            ),
        changed('coordinates', existing.coordinates, gate.coordinates, (a, b) =>
          coordinatesEqual(a as Coordinates, b as Coordinates),
        ),
      ],
      requires,
    );
  });

  const gone = current.gates
    .filter((gate) => !reported.has(gate.name))
    .map((gate) => removal(ProposedResource.Gate, gate.name));

  return [...compared, ...gone];
}

export function buildProposal(
  osm: OsmAirportData,
  current: CurrentAirportData,
): ProposedChange[] {
  return [
    ...airportChanges(osm, current),
    ...runwayChanges(osm.runways, current.runways),
    ...terminalChanges(osm.terminals, current),
    ...parkingPositionChanges(osm.parkingPositions, current),
    ...gateChanges(osm.gates, current),
  ];
}

const REMOVAL_RANK: Record<ProposedResource, number> = {
  [ProposedResource.Gate]: 0,
  [ProposedResource.ParkingPosition]: 1,
  [ProposedResource.Terminal]: 2,
  [ProposedResource.Runway]: 3,
  [ProposedResource.Airport]: 4,
};

const WRITE_RANK: Record<ProposedResource, number> = {
  [ProposedResource.Terminal]: 0,
  [ProposedResource.ParkingPosition]: 1,
  [ProposedResource.Gate]: 2,
  [ProposedResource.Runway]: 3,
  [ProposedResource.Airport]: 4,
};

/**
 * Removals run first, children before parents, so a terminal is empty by the
 * time it goes. Writes then run parents before children, so a stand has a
 * terminal to hang off.
 */
export function inApplyOrder(changes: ProposedChange[]): ProposedChange[] {
  const rank = (change: ProposedChange): number =>
    change.status === ProposedStatus.Removed
      ? REMOVAL_RANK[change.resource]
      : 10 + WRITE_RANK[change.resource];

  return [...changes].sort((a, b) => rank(a) - rank(b));
}

export function summarize(changes: ProposedChange[]): {
  added: number;
  removed: number;
  updated: number;
  notChanged: number;
} {
  const count = (status: ProposedStatus): number =>
    changes.filter((change) => change.status === status).length;

  return {
    added: count(ProposedStatus.Added),
    removed: count(ProposedStatus.Removed),
    updated: count(ProposedStatus.Updated),
    notChanged: count(ProposedStatus.NotChanged),
  };
}
