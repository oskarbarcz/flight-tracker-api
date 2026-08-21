import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { getErrorMessage } from '../../../../../core/utils/error-message';
import {
  OsmAirportData,
  OsmGate,
  OsmParkingPosition,
  OsmRunway,
  OsmTerminal,
} from '../../../../../core/provider/osm/type/osm.types';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { GatesRepository } from '../../../infra/database/gates.repository';
import { ParkingPositionsRepository } from '../../../infra/database/parking-positions.repository';
import { RunwaysRepository } from '../../../infra/database/runways.repository';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { CreateGateRequest } from '../../../infra/http/request/gate.dto';
import { CreateParkingPositionRequest } from '../../../infra/http/request/parking-position.dto';
import { CreateRunwayRequest } from '../../../infra/http/request/runway.dto';
import { CreateTerminalRequest } from '../../../infra/http/request/terminal.dto';
import { UpdateAirportResponse } from '../../../infra/http/request/airport.dto';
import {
  AirportSnapshot,
  OsmAirportDataService,
} from '../../../infra/service/osm-airport-data.service';
import { Coordinates } from '../../../model/airport.model';
import {
  AirportOsmPullRequiredError,
  UnknownProposedChangesError,
} from '../../../model/error/osm-upgrade.error';
import { buildProposal, inApplyOrder } from '../../../model/osm-upgrade.diff';
import {
  AirportOsmPushResult,
  ProposedChange,
  ProposedResource,
  ProposedStatus,
  PushedChange,
  PushOutcome,
  PushTotals,
} from '../../../model/osm-upgrade.model';
import { GateCategory } from '../../../model/gate.model';
import {
  DeicingOption,
  FuelingOptions,
  GpuAvailability,
  ParkingAssistanceType,
  ParkingLocation,
  ParkingPositionType,
  ParkingSpotType,
  PcaAvailability,
  StairOption,
} from '../../../model/parking-position.model';
import { YesOrNoString } from '../../../../../core/types/monada';
import { LightingType, SurfaceType } from '../../../model/runway.model';

export class PushAirportOsmDataCommand {
  constructor(
    public readonly airportId: string,
    public readonly keys: string[],
  ) {}
}

/** Never escapes the handler: it becomes one failed change in the result. */
class UnresolvedReferenceError extends Error {
  constructor(reference: string) {
    super(
      `Requires ${reference}, which does not exist and was not pushed alongside it.`,
    );
  }
}

interface PushContext {
  airportId: string;
  osm: OsmAirportData;
  snapshot: AirportSnapshot;
}

function patchOf(change: ProposedChange): Record<string, unknown> {
  return Object.fromEntries(
    change.fields.map((field) => [field.field, field.proposed]),
  );
}

function outcome(
  change: ProposedChange,
  result: PushOutcome,
  reason?: string,
): PushedChange {
  return { key: change.key, outcome: result, reason: reason ?? null };
}

/**
 * The proposal is rebuilt from the retained pull rather than trusted from the
 * request, so what lands is what was reviewed.
 */
@CommandHandler(PushAirportOsmDataCommand)
export class PushAirportOsmDataHandler implements ICommandHandler<
  PushAirportOsmDataCommand,
  AirportOsmPushResult
> {
  private readonly logger = new Logger(PushAirportOsmDataHandler.name);

  constructor(
    private readonly airportsRepository: AirportsRepository,
    private readonly terminalsRepository: TerminalsRepository,
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
    private readonly gatesRepository: GatesRepository,
    private readonly runwaysRepository: RunwaysRepository,
    private readonly osmAirportData: OsmAirportDataService,
  ) {}

  async execute(
    command: PushAirportOsmDataCommand,
  ): Promise<AirportOsmPushResult> {
    const { airportId, keys } = command;

    const airport = await this.airportsRepository.findById(airportId);

    const retained = await this.osmAirportData.retained(airportId);

    if (!retained) {
      throw new AirportOsmPullRequiredError();
    }

    const snapshot = await this.osmAirportData.snapshot(airportId);
    const changes = buildProposal(retained.data, {
      ...snapshot.current,
      location: airport.location as unknown as Coordinates,
      shape: airport.shape as unknown as Coordinates[] | null,
    });

    const byKey = new Map(changes.map((change) => [change.key, change]));
    const unknown = keys.filter((key) => !byKey.has(key));

    if (unknown.length > 0) {
      throw new UnknownProposedChangesError(unknown);
    }

    const selected = inApplyOrder(keys.map((key) => byKey.get(key)!));
    const context: PushContext = { airportId, osm: retained.data, snapshot };
    const applied: PushedChange[] = [];

    for (const change of selected) {
      applied.push(await this.applyOne(change, context));
    }

    return {
      airportId,
      icaoCode: airport.icaoCode,
      totals: this.tally(applied),
      changes: applied,
    };
  }

  private async applyOne(
    change: ProposedChange,
    context: PushContext,
  ): Promise<PushedChange> {
    if (change.status === ProposedStatus.NotChanged) {
      return outcome(
        change,
        PushOutcome.Skipped,
        'OpenStreetMap agrees with the airport model; nothing to write.',
      );
    }

    try {
      switch (change.resource) {
        case ProposedResource.Airport:
          return await this.applyAirportField(change, context);
        case ProposedResource.Terminal:
          return await this.applyTerminal(change, context);
        case ProposedResource.ParkingPosition:
          return await this.applyParkingPosition(change, context);
        case ProposedResource.Gate:
          return await this.applyGate(change, context);
        case ProposedResource.Runway:
          return await this.applyRunway(change, context);
      }
    } catch (error) {
      const reason = getErrorMessage(error);

      if (!(error instanceof UnresolvedReferenceError)) {
        this.logger.error(
          `Pushing ${change.key} to airport ${context.airportId} failed: ${reason}`,
        );
      }

      return outcome(change, PushOutcome.Failed, reason);
    }
  }

  private async applyAirportField(
    change: ProposedChange,
    context: PushContext,
  ): Promise<PushedChange> {
    if (change.status === ProposedStatus.Removed) {
      await this.airportsRepository.update(context.airportId, {
        [change.label]: null,
      } as UpdateAirportResponse);

      return outcome(change, PushOutcome.Removed);
    }

    await this.airportsRepository.update(
      context.airportId,
      patchOf(change) as UpdateAirportResponse,
    );

    return outcome(change, PushOutcome.Updated);
  }

  private async applyTerminal(
    change: ProposedChange,
    context: PushContext,
  ): Promise<PushedChange> {
    const { snapshot, airportId } = context;

    if (change.status === ProposedStatus.Removed) {
      await this.terminalsRepository.remove(
        this.existingId(
          snapshot.terminalIdByShortName,
          change.label,
          `terminal ${change.label}`,
        ),
      );

      return outcome(change, PushOutcome.Removed);
    }

    if (change.status === ProposedStatus.Added) {
      const terminal = this.osmRecord(
        context.osm.terminals,
        (entry) => entry.shortName === change.label,
        `terminal ${change.label}`,
      );
      const terminalId = v4();

      await this.terminalsRepository.create(
        airportId,
        terminalId,
        this.toTerminalRequest(terminal),
      );
      snapshot.terminalIdByShortName.set(terminal.shortName, terminalId);

      return outcome(change, PushOutcome.Added);
    }

    await this.terminalsRepository.update(
      this.existingId(
        snapshot.terminalIdByShortName,
        change.label,
        `terminal ${change.label}`,
      ),
      patchOf(change),
    );

    return outcome(change, PushOutcome.Updated);
  }

  private async applyParkingPosition(
    change: ProposedChange,
    context: PushContext,
  ): Promise<PushedChange> {
    const { snapshot, airportId } = context;

    if (change.status === ProposedStatus.Removed) {
      await this.parkingPositionsRepository.remove(
        this.existingId(
          snapshot.parkingPositionIdByName,
          change.label,
          `parking position ${change.label}`,
        ),
      );

      return outcome(change, PushOutcome.Removed);
    }

    if (change.status === ProposedStatus.Added) {
      const position = this.osmRecord(
        context.osm.parkingPositions,
        (entry) => entry.name === change.label,
        `parking position ${change.label}`,
      );
      const parkingPositionId = v4();

      await this.parkingPositionsRepository.create(
        airportId,
        parkingPositionId,
        {
          ...this.toParkingPositionRequest(position),
          terminalId: this.terminalId(position.terminal, snapshot),
        },
      );
      snapshot.parkingPositionIdByName.set(position.name, parkingPositionId);

      return outcome(change, PushOutcome.Added);
    }

    await this.parkingPositionsRepository.update(
      this.existingId(
        snapshot.parkingPositionIdByName,
        change.label,
        `parking position ${change.label}`,
      ),
      this.withResolvedReferences(patchOf(change), snapshot),
    );

    return outcome(change, PushOutcome.Updated);
  }

  private async applyGate(
    change: ProposedChange,
    context: PushContext,
  ): Promise<PushedChange> {
    const { snapshot, airportId } = context;

    if (change.status === ProposedStatus.Removed) {
      await this.gatesRepository.remove(
        this.existingId(
          snapshot.gateIdByName,
          change.label,
          `gate ${change.label}`,
        ),
      );

      return outcome(change, PushOutcome.Removed);
    }

    if (change.status === ProposedStatus.Added) {
      const gate = this.osmRecord(
        context.osm.gates,
        (entry) => entry.name === change.label,
        `gate ${change.label}`,
      );

      await this.gatesRepository.create(airportId, v4(), {
        ...this.toGateRequest(gate),
        terminalId: this.terminalId(gate.terminal, snapshot),
        parkingPositionId: gate.parkingPosition
          ? this.parkingPositionId(gate.parkingPosition, snapshot)
          : null,
      });

      return outcome(change, PushOutcome.Added);
    }

    await this.gatesRepository.update(
      this.existingId(
        snapshot.gateIdByName,
        change.label,
        `gate ${change.label}`,
      ),
      this.withResolvedReferences(patchOf(change), snapshot),
    );

    return outcome(change, PushOutcome.Updated);
  }

  private async applyRunway(
    change: ProposedChange,
    context: PushContext,
  ): Promise<PushedChange> {
    const { snapshot, airportId } = context;

    if (change.status === ProposedStatus.Removed) {
      await this.runwaysRepository.remove(
        this.existingId(
          snapshot.runwayIdByDesignator,
          change.label,
          `runway ${change.label}`,
        ),
      );

      return outcome(change, PushOutcome.Removed);
    }

    if (change.status === ProposedStatus.Added) {
      const runway = this.osmRecord(
        context.osm.runways,
        (entry) => entry.designator === change.label,
        `runway ${change.label}`,
      );

      await this.runwaysRepository.create(
        airportId,
        v4(),
        this.toRunwayRequest(runway),
      );

      return outcome(change, PushOutcome.Added);
    }

    await this.runwaysRepository.update(
      this.existingId(
        snapshot.runwayIdByDesignator,
        change.label,
        `runway ${change.label}`,
      ),
      patchOf(change),
    );

    return outcome(change, PushOutcome.Updated);
  }

  private withResolvedReferences(
    patch: Record<string, unknown>,
    snapshot: AirportSnapshot,
  ): Record<string, any> {
    const { terminal, parkingPosition, ...rest } = patch;
    const resolved: Record<string, unknown> = { ...rest };

    if (terminal !== undefined) {
      resolved.terminalId = this.terminalId(terminal as string, snapshot);
    }

    if (parkingPosition !== undefined) {
      resolved.parkingPositionId =
        parkingPosition === null
          ? null
          : this.parkingPositionId(parkingPosition as string, snapshot);
    }

    return resolved;
  }

  private terminalId(shortName: string, snapshot: AirportSnapshot): string {
    return this.existingId(
      snapshot.terminalIdByShortName,
      shortName,
      `terminal ${shortName}`,
    );
  }

  private parkingPositionId(name: string, snapshot: AirportSnapshot): string {
    return this.existingId(
      snapshot.parkingPositionIdByName,
      name,
      `parking position ${name}`,
    );
  }

  private existingId(
    ids: Map<string, string>,
    key: string,
    reference: string,
  ): string {
    const id = ids.get(key);

    if (!id) {
      throw new UnresolvedReferenceError(reference);
    }

    return id;
  }

  private osmRecord<T>(
    records: T[],
    matches: (record: T) => boolean,
    reference: string,
  ): T {
    const record = records.find(matches);

    if (!record) {
      throw new UnresolvedReferenceError(reference);
    }

    return record;
  }

  private toRunwayRequest(runway: OsmRunway): CreateRunwayRequest {
    return {
      designator: runway.designator,
      length: runway.length,
      width: runway.width,
      magneticHeading: runway.magneticHeading,
      trueHeading: runway.trueHeading,
      elevation: runway.elevation ?? null,
      surfaceType: runway.surfaceType as SurfaceType,
      lightingType: runway.lightingType as LightingType,
      coordinates: runway.coordinates,
    };
  }

  private toTerminalRequest(terminal: OsmTerminal): CreateTerminalRequest {
    return {
      shortName: terminal.shortName,
      fullName: terminal.fullName,
      averageTaxiTime: terminal.averageTaxiTime,
      operatorCodes: terminal.operatorCodes,
      text: terminal.text ?? null,
      shape: terminal.shape ?? null,
    };
  }

  private toParkingPositionRequest(
    position: OsmParkingPosition,
  ): Omit<CreateParkingPositionRequest, 'terminalId'> {
    return {
      name: position.name,
      bridge: position.bridge as YesOrNoString,
      stairs: position.stairs as StairOption,
      deicing: position.deicing as DeicingOption,
      gpu: position.gpu as GpuAvailability,
      pca: position.pca as PcaAvailability,
      type: position.type as ParkingPositionType,
      spotType: position.spotType as ParkingSpotType,
      assistance: position.assistance as ParkingAssistanceType,
      location: position.location as ParkingLocation,
      noiseSensitivity: position.noiseSensitivity as YesOrNoString,
      fuelingOptions: position.fuelingOptions as FuelingOptions,
      coordinates: position.coordinates,
    };
  }

  private toGateRequest(
    gate: OsmGate,
  ): Omit<CreateGateRequest, 'terminalId' | 'parkingPositionId'> {
    return {
      name: gate.name,
      category: gate.category as GateCategory,
      coordinates: gate.coordinates,
    };
  }

  private tally(applied: PushedChange[]): PushTotals {
    const count = (result: PushOutcome): number =>
      applied.filter((change) => change.outcome === result).length;

    return {
      added: count(PushOutcome.Added),
      removed: count(PushOutcome.Removed),
      updated: count(PushOutcome.Updated),
      skipped: count(PushOutcome.Skipped),
      failed: count(PushOutcome.Failed),
    };
  }
}
