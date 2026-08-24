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
  allocateSeats,
  assignPnrs,
  assignSpecialServices,
  cabinSizesOf,
  targetPerCabin,
} from '../../model/manifest-generation';
import { passengerNameFactory } from '../../model/passenger-name';
import { GetPassengerLocaleQuery } from '../query/get-passenger-locale.query';
import { seatsOf } from '../../model/seat-map.reader';
import { GetAircraftCabinLayoutQuery } from '../../../aircraft/application/query/get-aircraft-cabin-layout.query';
import { EnsureCabinLayoutVersionCommand } from '../../../cabin-layouts/application/command/ensure-cabin-layout-version.command';
import { GetCabinSeatMapQuery } from '../../../cabin-layouts/application/query/get-cabin-seat-map.query';
import { CabinSeatMap } from '../../../cabin-layouts/model/cabin-seat-map.model';

export class GenerateFlightManifestCommand {
  constructor(
    public readonly flightId: string,
    public readonly aircraftId: string,
    public readonly operatorId: string,
    public readonly passengers: number,
    public readonly passengersByCabin?: Record<string, number> | null,
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
    const { flightId, aircraftId, operatorId, passengers, passengersByCabin } =
      command;

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

    const cabinSeats = seatsOf(seatMap);
    const target = targetPerCabin(
      cabinSizesOf(cabinSeats),
      passengers,
      passengersByCabin,
    );

    const localeQuery = new GetPassengerLocaleQuery(operatorId);
    const nextName = passengerNameFactory(
      await this.queryBus.execute(localeQuery),
    );
    const seats = allocateSeats(cabinSeats, target);
    const pnrs = assignPnrs(seats.length);
    const specialServices = assignSpecialServices(seats.length);

    const manifest: NewPassenger[] = seats.map((seat, index) => ({
      ...seat,
      name: nextName(),
      pnr: pnrs[index],
      ssr: specialServices[index],
    }));

    await this.passengersRepository.replace(flightId, manifest);

    const pinLayout = new PinFlightCabinLayoutCommand(
      flightId,
      seatMap.layoutId,
      seatMap.revision,
    );
    await this.commandBus.execute(pinLayout);
  }
}
