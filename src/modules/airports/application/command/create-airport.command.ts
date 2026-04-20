import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAirportRequest } from '../../infra/http/request/airport.dto';
import { AirportsRepository } from '../../infra/database/airports.repository';

export class CreateAirportCommand {
  constructor(
    public readonly airportId: string,
    public readonly data: CreateAirportRequest,
  ) {}
}

@CommandHandler(CreateAirportCommand)
export class CreateAirportHandler implements ICommandHandler<CreateAirportCommand> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(command: CreateAirportCommand): Promise<void> {
    const { airportId, data } = command;
    await this.repository.create(airportId, data);
  }
}
