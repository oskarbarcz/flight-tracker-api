import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightTracking } from '../../model/flight.entity';
import { NotFoundException } from '@nestjs/common';
import { FlightDoesNotExistError } from '../../infra/http/request/errors.dto';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';

export class ChangeFlightVisibilityCommand {
  constructor(
    public readonly flightId: string,
    public readonly visibility: FlightTracking,
  ) {}
}

@CommandHandler(ChangeFlightVisibilityCommand)
export class ChangeFlightVisibilityHandler implements ICommandHandler<ChangeFlightVisibilityCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
  ) {}

  async execute(command: ChangeFlightVisibilityCommand): Promise<void> {
    const { flightId, visibility } = command;
    const query = new GetFlightByIdQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    await this.flightsRepository.updateVisibility(flightId, visibility);
  }
}
