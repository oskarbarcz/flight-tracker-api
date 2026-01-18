import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAirportRequest } from '../../dto/airport.dto';
import { AirportsRepository } from '../../repository/airports.repository';

export class CreateAirportCommand {
  constructor(public readonly data: CreateAirportRequest) {}
}

@CommandHandler(CreateAirportCommand)
export class CreateAirportHandler implements ICommandHandler<
  CreateAirportCommand,
  string
> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(command: CreateAirportCommand): Promise<string> {
    const { data } = command;
    const airport = await this.repository.create(data);
    return airport.id;
  }
}
