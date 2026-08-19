import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import {
  NewPassenger,
  PassengersRepository,
} from '../../infra/database/repository/passengers.repository';
import { PinFlightCabinLayoutCommand } from '../../../flights/application/command/pin-flight-cabin-layout.command';
import { SeatCapacityExceededError } from '../../model/error/manifest.error';
import {
  AllocatableSeat,
  allocateSeats,
  assignPnrs,
} from '../../model/manifest-generation';
import {
  passengerNameFactory,
  resolvePassengerLocale,
} from '../../model/passenger-name';
import { GetAircraftCabinLayoutQuery } from '../../../aircraft/application/query/get-aircraft-cabin-layout.query';
import { EnsureCabinLayoutVersionCommand } from '../../../cabin-layouts/application/command/ensure-cabin-layout-version.command';
import { GetCabinSeatMapQuery } from '../../../cabin-layouts/application/query/get-cabin-seat-map.query';
import { CabinSeatMap } from '../../../cabin-layouts/model/cabin-seat-map.model';
import { GetOperatorByIdQuery } from '../../../operators/application/query/get-operator-by-id.query';
import { Operator } from '../../../operators/model/operator.model';
import { GetAirportCountryByIataCodeQuery } from '../../../airports/application/query/get-airport-country-by-iata-code.query';

export class GenerateFlightManifestCommand {
  constructor(
    public readonly flightId: string,
    public readonly aircraftId: string,
    public readonly operatorId: string,
    public readonly passengers: number,
  ) {}
}

@CommandHandler(GenerateFlightManifestCommand)
export class GenerateFlightManifestHandler implements ICommandHandler<GenerateFlightManifestCommand> {
  constructor(
    private readonly passengersRepository: PassengersRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: GenerateFlightManifestCommand): Promise<void> {
    const { flightId, aircraftId, operatorId, passengers } = command;

    const layoutQuery = new GetAircraftCabinLayoutQuery(aircraftId);
    const cabinLayout: string | null = await this.queryBus.execute(layoutQuery);

    if (!cabinLayout) {
      return;
    }

    const ensureVersion = new EnsureCabinLayoutVersionCommand(cabinLayout);
    await this.commandBus.execute(ensureVersion);

    const seatMapQuery = new GetCabinSeatMapQuery(cabinLayout);
    const seatMap: CabinSeatMap = await this.queryBus.execute(seatMapQuery);

    if (passengers > seatMap.totalSeats) {
      throw new SeatCapacityExceededError(passengers, seatMap.totalSeats);
    }

    const nextName = passengerNameFactory(await this.resolveLocale(operatorId));
    const seats = allocateSeats(seatsOf(seatMap), passengers);
    const pnrs = assignPnrs(seats.length);

    const manifest: NewPassenger[] = seats.map((seat, index) => ({
      ...seat,
      name: nextName(),
      pnr: pnrs[index],
    }));

    await this.passengersRepository.replace(flightId, manifest);

    const pinLayout = new PinFlightCabinLayoutCommand(
      flightId,
      seatMap.layoutId,
      seatMap.revision,
    );
    await this.commandBus.execute(pinLayout);
  }

  private async resolveLocale(operatorId: string): Promise<string> {
    const operatorQuery = new GetOperatorByIdQuery(operatorId);
    const operator: Operator = await this.queryBus.execute(operatorQuery);
    const [hub] = operator.hubs;

    if (!hub) {
      return resolvePassengerLocale(null, operator.continent);
    }

    const countryQuery = new GetAirportCountryByIataCodeQuery(hub);
    const country: string | null = await this.queryBus.execute(countryQuery);

    return resolvePassengerLocale(country, operator.continent);
  }
}

function seatsOf(seatMap: CabinSeatMap): AllocatableSeat[] {
  return seatMap.decks.flatMap((deck) =>
    deck.seats.map((seat) => ({
      designator: seat.designator,
      deck: deck.deck,
      cabin: seat.cabin,
    })),
  );
}
