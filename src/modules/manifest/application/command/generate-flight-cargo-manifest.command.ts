import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CargoRepository } from '../../infra/database/repository/cargo.repository';
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
  looseSlotsOf,
  occupiedPositionsOf,
  planBaggageUnits,
  planCargoLoad,
  slotsOf,
} from '../../model/cargo-packing';
import { planBaggage } from '../../model/baggage';
import { awbPrefixFor } from '../../model/awb';
import { CargoAirport, JourneyContext } from '../../model/shipment-journey';
import { tradePartyFactory } from '../../model/trade-party';
import { toNewCargoUnit } from '../../model/cargo-unit-write';
import { resolvePassengerLocale } from '../../model/passenger-name';
import { Continent } from '../../../airports/model/airport.model';

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
        })
      : [];

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

    await this.cargoRepository.replace(
      flightId,
      [...planned, ...baggageUnits].map((unit) =>
        toNewCargoUnit(unit, context),
      ),
    );
  }
}
