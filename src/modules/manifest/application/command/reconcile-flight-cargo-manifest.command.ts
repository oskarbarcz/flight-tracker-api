import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import {
  CargoRepository,
  CargoUnitRow,
  CargoUnitTotals,
} from '../../infra/database/repository/cargo.repository';
import {
  AircraftHold,
  GetAircraftHoldQuery,
} from '../../../aircraft/application/query/get-aircraft-hold.query';
import { resolveHoldVariant } from '../../model/hold-variant-resolution';
import { HoldVariant } from '../../model/hold-layout.model';
import { capacityOf, maxWeightByVolume } from '../../model/hold-capacity';
import {
  HoldVolumeCapacityExceededError,
  HoldWeightCapacityExceededError,
  RetainedCargoExceedsFinalTonnageError,
} from '../../model/error/cargo.error';
import { offeredCommodities } from '../../model/commodity-selection';
import { offeredCommoditiesFor } from '../../model/cargo-aircraft-only.policy';
import {
  ambientFromMetar,
  upgradeOfferedSolutions,
} from '../../model/cold-chain';
import {
  ColdChainContext,
  looseSlotsOf,
  planCargoLoad,
  slotsOf,
} from '../../model/cargo-packing';
import {
  planCargoReconciliation,
  ReconcilableUnit,
  retainedCargoKg,
} from '../../model/cargo-reconciliation';
import { awbPrefixFor } from '../../model/awb';
import { CargoAirport, JourneyContext } from '../../model/shipment-journey';
import { tradePartyFactory } from '../../model/trade-party';
import { toNewCargoUnit } from '../../model/cargo-unit-write';
import { findCommodityById } from '../../data/cargo-commodities';
import {
  OffloadPriority,
  SpecialHandlingCode,
} from '../../model/commodity.model';
import { resolvePassengerLocale } from '../../model/passenger-name';
import { CargoEndpoint } from './generate-flight-cargo-manifest.command';
import {
  CargoContentClass,
  CargoOffloadReason,
  CargoShipmentStatus,
} from 'prisma/client/client';

const BUILD_UP_HOURS = 3;

export class ReconcileFlightCargoManifestCommand {
  constructor(
    public readonly flightId: string,
    public readonly aircraftId: string,
    public readonly operatorIata: string,
    public readonly cargoTons: number,
    public readonly passengers: number,
    public readonly departure: CargoEndpoint,
    public readonly arrival: CargoEndpoint,
    public readonly departureAt: Date,
    public readonly flightHours: number,
  ) {}
}

@CommandHandler(ReconcileFlightCargoManifestCommand)
export class ReconcileFlightCargoManifestHandler implements ICommandHandler<ReconcileFlightCargoManifestCommand> {
  constructor(
    private readonly cargoRepository: CargoRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: ReconcileFlightCargoManifestCommand): Promise<void> {
    const { flightId, aircraftId, cargoTons } = command;

    const hold: AircraftHold = await this.queryBus.execute(
      new GetAircraftHoldQuery(aircraftId),
    );
    const variant = resolveHoldVariant(hold.type, hold.holdVariant);
    const targetKg = Math.round(cargoTons * 1000);

    if (variant) {
      const capacity = capacityOf(variant);

      if (targetKg > capacity.weightKg) {
        throw new HoldWeightCapacityExceededError(targetKg, capacity.weightKg);
      }

      if (targetKg > maxWeightByVolume(capacity)) {
        throw new HoldVolumeCapacityExceededError(targetKg, capacity.volumeM3);
      }
    }

    const rows = await this.cargoRepository.findByFlight(flightId);

    if (rows.length === 0) {
      return;
    }

    const cargoRows = rows.filter(
      (row) => row.contentClass === CargoContentClass.cargo,
    );
    const reconcilable = cargoRows.map(toReconcilableUnit);
    const retainedKg = retainedCargoKg(reconcilable);

    if (targetKg < retainedKg) {
      throw new RetainedCargoExceedsFinalTonnageError(targetKg, retainedKg);
    }

    const plan = planCargoReconciliation(reconcilable, targetKg);
    const offloaded = new Set(
      plan.offloads.map((offload) => offload.shipmentId),
    );
    const emptied = new Set(plan.emptiedUnitIds);

    const totals: CargoUnitTotals[] = cargoRows
      .filter(
        (row) =>
          !emptied.has(row.id) &&
          row.shipments.some((shipment) => offloaded.has(shipment.id)),
      )
      .map((row) => ({
        id: row.id,
        grossKg: loadedShipmentsOf(row, offloaded).reduce(
          (sum, shipment) => sum + shipment.grossKg,
          0,
        ),
        volumeM3: round3(
          loadedShipmentsOf(row, offloaded).reduce(
            (sum, shipment) => sum + Number(shipment.volumeM3),
            0,
          ),
        ),
      }));

    await this.cargoRepository.reconcile(flightId, {
      offloads: plan.offloads.map((offload) => ({
        shipmentId: offload.shipmentId,
        reason: offload.reason as unknown as CargoOffloadReason,
        offloadedFrom: offload.offloadedFrom,
      })),
      emptiedUnitIds: plan.emptiedUnitIds,
      totals,
      added:
        plan.addKg > 0
          ? await this.planAddedUnits(
              command,
              variant,
              rows,
              offloaded,
              emptied,
              plan.addKg,
            )
          : [],
    });
  }

  private async planAddedUnits(
    command: ReconcileFlightCargoManifestCommand,
    variant: HoldVariant | null,
    rows: CargoUnitRow[],
    offloaded: Set<string>,
    emptied: Set<string>,
    addKg: number,
  ) {
    const {
      operatorIata,
      passengers,
      departure,
      arrival,
      departureAt,
      flightHours,
    } = command;

    const coldChain: ColdChainContext = {
      buildUpHours: BUILD_UP_HOURS,
      flightHours,
      ambientC: ambientFromMetar(
        await this.cargoRepository.latestMetar(arrival.iataCode),
      ),
    };

    const offered = upgradeOfferedSolutions(
      offeredCommoditiesFor(
        offeredCommodities({
          iataCode: departure.iataCode,
          country: departure.country,
          continent: departure.continent,
          month: departureAt.getUTCMonth() + 1,
        }),
        passengers,
      ),
      coldChain.buildUpHours + coldChain.flightHours,
    );

    const [networkAirports, carriers] = await Promise.all([
      this.cargoRepository.networkAirports([
        departure.iataCode,
        arrival.iataCode,
      ]),
      this.cargoRepository.carrierCodes(operatorIata),
    ]);

    const journey: JourneyContext = {
      leg: { departure: departure.iataCode, arrival: arrival.iataCode },
      departureContinent: departure.continent,
      arrivalContinent: arrival.continent,
      candidates: networkAirports as CargoAirport[],
      carriers,
      random: Math.random,
    };

    const surviving = rows.filter((row) => !emptied.has(row.id));
    const planned = planCargoLoad({
      targetKg: addKg,
      offered,
      slots: variant ? slotsOf(variant) : [],
      looseSlots: variant ? looseSlotsOf(variant) : [],
      journey,
      coldChain,
      random: Math.random,
      occupied: occupiedPositionsOf(surviving),
      compartmentLoad: compartmentLoadOf(surviving, offloaded),
      compartmentShc: compartmentShcOf(surviving, offloaded),
    });

    const context = {
      operatorIata,
      prefix: awbPrefixFor(operatorIata),
      parties: tradePartyFactory(
        resolvePassengerLocale(departure.country, departure.continent),
        resolvePassengerLocale(arrival.country, arrival.continent),
      ),
      carriers,
      random: Math.random,
    };

    return planned.map((unit) => toNewCargoUnit(unit, context));
  }
}

function toReconcilableUnit(row: CargoUnitRow): ReconcilableUnit {
  return {
    id: row.id,
    tareKg: row.tareKg,
    positionDesignator: row.positionDesignator,
    shipments: row.shipments
      .filter((shipment) => shipment.status === CargoShipmentStatus.loaded)
      .map((shipment) => ({
        id: shipment.id,
        grossKg: shipment.grossKg,
        offloadPriority:
          findCommodityById(shipment.commodityId)?.offloadPriority ??
          OffloadPriority.General,
      })),
  };
}

function loadedShipmentsOf(row: CargoUnitRow, offloaded: Set<string>) {
  return row.shipments.filter(
    (shipment) =>
      shipment.status === CargoShipmentStatus.loaded &&
      !offloaded.has(shipment.id),
  );
}

function occupiedPositionsOf(rows: CargoUnitRow[]): Set<string> {
  return new Set(
    rows
      .map((row) => row.positionDesignator)
      .filter((designator): designator is string => designator !== null),
  );
}

function compartmentLoadOf(
  rows: CargoUnitRow[],
  offloaded: Set<string>,
): Map<number, number> {
  const load = new Map<number, number>();

  for (const row of rows) {
    if (row.compartment === null) {
      continue;
    }

    const freight =
      row.contentClass === CargoContentClass.cargo
        ? loadedShipmentsOf(row, offloaded).reduce(
            (sum, shipment) => sum + shipment.grossKg,
            0,
          )
        : row.grossKg;

    load.set(
      row.compartment,
      (load.get(row.compartment) ?? 0) + row.tareKg + freight,
    );
  }

  return load;
}

function compartmentShcOf(
  rows: CargoUnitRow[],
  offloaded: Set<string>,
): Map<number, SpecialHandlingCode[]> {
  const codes = new Map<number, SpecialHandlingCode[]>();

  for (const row of rows) {
    if (row.compartment === null) {
      continue;
    }

    codes.set(row.compartment, [
      ...(codes.get(row.compartment) ?? []),
      ...loadedShipmentsOf(row, offloaded).flatMap(
        (shipment) => shipment.shc as SpecialHandlingCode[],
      ),
    ]);
  }

  return codes;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
