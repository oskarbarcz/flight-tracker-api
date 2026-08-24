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
import { offeredCommoditiesFor } from '../../model/cargo-aircraft-only.policy';
import {
  ambientFromMetar,
  upgradeOfferedSolutions,
} from '../../model/cold-chain';
import { ColdChainContext } from '../../model/cargo-packing';
import {
  compartmentLoadOfUnits,
  LoadContentClass,
  LoadUnitKind,
  looseSlotsOf,
  occupiedPositionsOf,
  planBaggageUnits,
  planCargoLoad,
  PlannedUnit,
  slotsOf,
} from '../../model/cargo-packing';
import { planBaggage } from '../../model/baggage';
import { findCommodityById } from '../../data/cargo-commodities';
import { awbPrefixFor, generateAwb } from '../../model/awb';
import {
  CargoAirport,
  isRaisedByOperator,
  JourneyContext,
} from '../../model/shipment-journey';
import { generateUldSerial } from '../../model/uld';
import { tradePartyFactory, TradeParties } from '../../model/trade-party';
import { resolvePassengerLocale } from '../../../passengers/model/passenger-name';
import { Continent } from '../../../airports/model/airport.model';
import {
  CargoContentClass,
  CargoDeck as PrismaCargoDeck,
  CargoTransferRole as PrismaTransferRole,
  CargoUnitKind,
  Prisma,
} from 'prisma/client/client';

const BUILD_UP_HOURS = 3;

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
    public readonly passengers: number,
    public readonly departure: CargoEndpoint,
    public readonly arrival: CargoEndpoint,
    public readonly departureAt: Date,
    public readonly flightHours: number,
    public readonly payloadTons: number,
    public readonly passengersByCabin: Record<string, number> | null,
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
      passengers,
      departure,
      arrival,
      departureAt,
      flightHours,
      payloadTons,
      passengersByCabin,
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

    const planned = planCargoLoad({
      targetKg,
      offered,
      slots: variant ? slotsOf(variant) : [],
      looseSlots: variant ? looseSlotsOf(variant) : [],
      journey,
      coldChain,
      random: Math.random,
    });

    const baggage = planBaggage({
      payloadTons,
      passengers,
      cargoTons,
      distanceKm: await this.cargoRepository.flightDistanceKm(flightId),
      passengersByCabin,
    });

    const baggageUnits = variant
      ? planBaggageUnits({
          plan: baggage,
          slots: slotsOf(variant),
          looseSlots: looseSlotsOf(variant),
          occupied: occupiedPositionsOf(planned),
          compartmentLoad: compartmentLoadOfUnits(planned),
          random: Math.random,
        })
      : [];

    const parties = tradePartyFactory(
      resolvePassengerLocale(departure.country, departure.continent),
      resolvePassengerLocale(arrival.country, arrival.continent),
    );
    const prefix = awbPrefixFor(operatorIata);

    await this.cargoRepository.replace(
      flightId,
      [...planned, ...baggageUnits].map((unit) =>
        this.toNewUnit(unit, operatorIata, prefix, parties, carriers),
      ),
    );
  }

  private toNewUnit(
    unit: PlannedUnit,
    operatorIata: string,
    prefix: string,
    parties: TradeParties,
    carriers: string[],
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
      contentClass:
        unit.contentClass === LoadContentClass.Baggage
          ? CargoContentClass.baggage
          : CargoContentClass.cargo,
      beyondDestination: unit.beyondDestination,
      sealed: unit.sealed,
      bagCount: unit.bagCount,
      priority: unit.priority,
      baggageSource: unit.baggageSource,
      shipments: unit.shipments.map((shipment) => ({
        commodityId: shipment.commodityId,
        description: shipment.description,
        awb: generateAwb(
          isRaisedByOperator(shipment.journey.transferRole)
            ? prefix
            : awbPrefixFor(inboundCarrier(carriers)),
          Math.random(),
        ),
        pieces: shipment.pieces,
        grossKg: shipment.grossKg,
        volumeM3: shipment.volumeM3,
        shc: findCommodityById(shipment.commodityId)?.shc ?? [],
        shipper: parties.shipper(),
        consignee: parties.consignee(),
        origin: shipment.journey.origin,
        destination: shipment.journey.destination,
        transferRole: shipment.journey
          .transferRole as unknown as PrismaTransferRole,
        onwardCarrier: shipment.journey.onwardCarrier,
        onwardFlightNumber: shipment.journey.onwardFlightNumber,
        connectionMinutes: shipment.journey.connectionMinutes,
        dangerousGoods: dangerousGoodsOf(shipment.commodityId),
        temperatureControl:
          (shipment.coldChain as unknown as Prisma.InputJsonValue) ??
          Prisma.DbNull,
      })),
    };
  }
}

function dangerousGoodsOf(
  commodityId: string,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  const declaration = findCommodityById(commodityId)?.dangerousGoods;

  return declaration
    ? (declaration as unknown as Prisma.InputJsonValue)
    : Prisma.DbNull;
}

function inboundCarrier(carriers: string[]): string {
  return carriers.length === 0
    ? 'ZZ'
    : carriers[Math.floor(Math.random() * carriers.length)];
}
