import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  FlightDoesNotExistError,
  ScheduledFlightCannotBeRemovedError,
} from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';

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
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.Created) {
      throw new ScheduledFlightCannotBeRemovedError();
    }

    await this.flightsRepository.remove(flightId);
  }
}
