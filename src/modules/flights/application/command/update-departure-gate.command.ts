import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightDoesNotExistError } from '../../infra/http/request/errors.dto';
import { InvalidStatusToUpdateDepartureGateError } from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';

export class UpdateDepartureGateCommand {
  constructor(
    public readonly flightId: string,
    public readonly departureGateId: string | null,
  ) {}
}

@CommandHandler(UpdateDepartureGateCommand)
export class UpdateDepartureGateHandler implements ICommandHandler<UpdateDepartureGateCommand> {
  constructor(private readonly flightsRepository: FlightsRepository) {}

  async execute(command: UpdateDepartureGateCommand): Promise<void> {
    const { flightId, departureGateId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    const preCheckInStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
    ];
    if (!preCheckInStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateDepartureGateError();
    }

    await this.flightsRepository.updateDeparture(flightId, { departureGateId });
  }
}
