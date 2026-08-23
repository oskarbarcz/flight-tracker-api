import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import {
  CargoRepository,
  NewCargoUnit,
} from '../../infra/database/repository/cargo.repository';
import {
  GetAircraftHoldQuery,
  AircraftHold,
} from '../../../aircraft/application/query/get-aircraft-hold.query';
import { resolveHoldVariant } from '../../model/hold-variant-resolution';
import { capacityOf, maxWeightByVolume } from '../../model/hold-capacity';
import {
  HoldVolumeCapacityExceededError,
  HoldWeightCapacityExceededError,
} from '../../model/error/cargo.error';
import { offeredCommodities } from '../../model/commodity-selection';
import {
  LoadUnitKind,
  looseSlotsOf,
  planCargoLoad,
  PlannedUnit,
  slotsOf,
} from '../../model/cargo-packing';
import { findCommodityById } from '../../data/cargo-commodities';
import { awbPrefixFor, generateAwb } from '../../model/awb';
import { generateUldSerial } from '../../model/uld';
import { tradePartyFactory, TradeParties } from '../../model/trade-party';
import { resolvePassengerLocale } from '../../../passengers/model/passenger-name';
import { Continent } from '../../../airports/model/airport.model';
import {
  CargoContentClass,
  CargoDeck as PrismaCargoDeck,
  CargoUnitKind,
} from 'prisma/client/client';

export type CargoEndpoint = {
  iataCode: string;
  country: string;
  continent: Continent;
};

export class GenerateFlightCargoManifestCommand {
  constructor(
    public readonly flightId: string,
    public readonly aircraftId: string,
    public readonly operatorIata: string,
    public readonly cargoTons: number,
    public readonly departure: CargoEndpoint,
    public readonly arrival: CargoEndpoint,
    public readonly departureAt: Date,
  ) {}
}

@CommandHandler(GenerateFlightCargoManifestCommand)
export class GenerateFlightCargoManifestHandler implements ICommandHandler<GenerateFlightCargoManifestCommand> {
  constructor(
    private readonly cargoRepository: CargoRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: GenerateFlightCargoManifestCommand): Promise<void> {
    const {
      flightId,
      aircraftId,
      operatorIata,
      cargoTons,
      departure,
      arrival,
      departureAt,
    } = command;

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

    if (targetKg <= 0) {
      await this.cargoRepository.replace(flightId, []);

      return;
    }

    const offered = offeredCommodities({
      iataCode: departure.iataCode,
      country: departure.country,
      continent: departure.continent,
      month: departureAt.getUTCMonth() + 1,
    });

    const planned = planCargoLoad({
      targetKg,
      offered,
      slots: variant ? slotsOf(variant) : [],
      looseSlots: variant ? looseSlotsOf(variant) : [],
      random: Math.random,
    });

    const parties = tradePartyFactory(
      resolvePassengerLocale(departure.country, departure.continent),
      resolvePassengerLocale(arrival.country, arrival.continent),
    );
    const prefix = awbPrefixFor(operatorIata);

    await this.cargoRepository.replace(
      flightId,
      planned.map((unit) =>
        this.toNewUnit(unit, operatorIata, prefix, parties),
      ),
    );
  }

  private toNewUnit(
    unit: PlannedUnit,
    operatorIata: string,
    prefix: string,
    parties: TradeParties,
  ): NewCargoUnit {
    const containerised = unit.kind === LoadUnitKind.Uld;

    return {
      kind: containerised ? CargoUnitKind.uld : CargoUnitKind.bulk_lot,
      deck: unit.deck ? (unit.deck as unknown as PrismaCargoDeck) : null,
      compartment: unit.compartment,
      positionDesignator: unit.positionDesignator,
      uldType: unit.uldType,
      uldSerial: containerised ? generateUldSerial(Math.random()) : null,
      uldOwner: containerised ? operatorIata : null,
      tareKg: unit.tareKg,
      grossKg: unit.grossKg,
      volumeM3: unit.volumeM3,
      contentClass: CargoContentClass.cargo,
      shipments: unit.shipments.map((shipment) => ({
        commodityId: shipment.commodityId,
        description: shipment.description,
        awb: generateAwb(prefix, Math.random()),
        pieces: shipment.pieces,
        grossKg: shipment.grossKg,
        volumeM3: shipment.volumeM3,
        shc: findCommodityById(shipment.commodityId)?.shc ?? [],
        shipper: parties.shipper(),
        consignee: parties.consignee(),
      })),
    };
  }
}
