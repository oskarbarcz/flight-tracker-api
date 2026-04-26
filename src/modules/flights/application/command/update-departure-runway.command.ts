import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightDoesNotExistError } from '../../infra/http/request/errors.dto';
import { InvalidStatusToUpdateDepartureRunwayError } from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';

export class UpdateDepartureRunwayCommand {
  constructor(
    public readonly flightId: string,
    public readonly departureRunwayId: string | null,
  ) {}
}

@CommandHandler(UpdateDepartureRunwayCommand)
export class UpdateDepartureRunwayHandler implements ICommandHandler<UpdateDepartureRunwayCommand> {
  constructor(private readonly flightsRepository: FlightsRepository) {}

  async execute(command: UpdateDepartureRunwayCommand): Promise<void> {
    const { flightId, departureRunwayId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    const preTakeoffStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
      FlightStatus.CheckedIn,
      FlightStatus.BoardingStarted,
      FlightStatus.BoardingFinished,
      FlightStatus.TaxiingOut,
    ];
    if (!preTakeoffStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateDepartureRunwayError();
    }

    await this.flightsRepository.updateDeparture(flightId, {
      departureRunwayId,
    });
  }
}
