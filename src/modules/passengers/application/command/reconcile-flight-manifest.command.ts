import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import {
  NewPassenger,
  PassengersRepository,
} from '../../infra/database/repository/passengers.repository';
import { SeatCapacityExceededError } from '../../model/error/manifest.error';
import {
  assignPnrs,
  cabinSizesOf,
  planReconciliation,
  targetPerCabin,
} from '../../model/manifest-generation';
import { passengerNameFactory } from '../../model/passenger-name';
import { PassengerStatus } from '../../model/manifest.model';
import { seatsOf } from '../../model/seat-map.reader';
import { GetPassengerLocaleQuery } from '../query/get-passenger-locale.query';
import {
  FlightManifestContext,
  GetFlightManifestContextQuery,
} from '../../../flights/application/query/get-flight-manifest-context.query';
import { GetCabinSeatMapQuery } from '../../../cabin-layouts/application/query/get-cabin-seat-map.query';
import { CabinSeatMap } from '../../../cabin-layouts/model/cabin-seat-map.model';

export class ReconcileFlightManifestCommand {
  constructor(
    public readonly flightId: string,
    public readonly passengers: number,
    public readonly passengersByCabin?: Record<string, number> | null,
  ) {}
}

@CommandHandler(ReconcileFlightManifestCommand)
export class ReconcileFlightManifestHandler implements ICommandHandler<ReconcileFlightManifestCommand> {
  constructor(
    private readonly passengersRepository: PassengersRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: ReconcileFlightManifestCommand): Promise<void> {
    const { flightId, passengers, passengersByCabin } = command;

    const contextQuery = new GetFlightManifestContextQuery(flightId);
    const flight: FlightManifestContext =
      await this.queryBus.execute(contextQuery);

    if (!flight.cabinLayout || flight.cabinLayoutRevision === null) {
      return;
    }

    const seatMapQuery = new GetCabinSeatMapQuery(
      flight.cabinLayout,
      flight.cabinLayoutRevision,
    );
    const seatMap: CabinSeatMap = await this.queryBus.execute(seatMapQuery);

    if (passengers > seatMap.totalSeats) {
      throw new SeatCapacityExceededError(passengers, seatMap.totalSeats);
    }

    const seats = seatsOf(seatMap);
    const target = targetPerCabin(
      cabinSizesOf(seats),
      passengers,
      passengersByCabin,
    );

    const rows = await this.passengersRepository.findByFlight(flightId);
    const manifest = rows.map((row) => ({
      designator: row.designator,
      cabin: row.cabin,
      status: row.status as PassengerStatus,
    }));

    const plan = planReconciliation(seats, manifest, target);

    if (plan.noShows.length > 0) {
      await this.passengersRepository.markAsNoShow(flightId, plan.noShows);
    }

    if (plan.additions.length === 0) {
      return;
    }

    const localeQuery = new GetPassengerLocaleQuery(flight.operatorId);
    const nextName = passengerNameFactory(
      await this.queryBus.execute(localeQuery),
    );
    const pnrs = assignPnrs(plan.additions.length);

    const added: NewPassenger[] = plan.additions.map((seat, index) => ({
      ...seat,
      name: nextName(),
      pnr: pnrs[index],
    }));

    await this.passengersRepository.add(flightId, added);
  }
}
