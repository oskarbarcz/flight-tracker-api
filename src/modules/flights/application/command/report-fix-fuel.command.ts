import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToReportFixFuelError,
  RouteFixDoesNotExistError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';

export class ReportFixFuelCommand {
  constructor(
    public readonly flightId: string,
    public readonly ordinal: number,
    public readonly actualOnBoard: number,
  ) {}
}

@CommandHandler(ReportFixFuelCommand)
export class ReportFixFuelHandler implements ICommandHandler<ReportFixFuelCommand> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(command: ReportFixFuelCommand): Promise<void> {
    const { flightId, ordinal, actualOnBoard } = command;

    const flight = await this.repository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.InCruise) {
      throw new InvalidStatusToReportFixFuelError();
    }

    const route = await this.repository.findPlannedRoute(flightId);
    if (!route?.fixes.some((fix) => fix.ordinal === ordinal)) {
      throw new RouteFixDoesNotExistError();
    }

    await this.repository.saveFixFuelReport(flightId, ordinal, actualOnBoard);
  }
}
