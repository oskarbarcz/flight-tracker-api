import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightStatus } from '../../entity/flight.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  FlightDoesNotExistError,
  ScheduledFlightCannotBeRemoved,
} from '../../dto/errors.dto';
import { FlightsRepository } from '../../repository/flights.repository';

export class RemoveFlightCommand {
  constructor(public readonly flightId: string) {}
}

@CommandHandler(RemoveFlightCommand)
export class RemoveFlightHandler implements ICommandHandler<RemoveFlightCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
  ) {}

  async execute(command: RemoveFlightCommand): Promise<void> {
    const { flightId } = command;
    const query = new GetFlightByIdQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Created) {
      throw new BadRequestException(ScheduledFlightCannotBeRemoved);
    }

    await this.flightsRepository.remove(flightId);
  }
}
