import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAirportResponse } from '../../dto/airport.dto';
import { AirportsRepository } from '../../repository/airports.repository';

export class UpdateAirportCommand {
  constructor(
    public readonly airportId: string,
    public readonly data: UpdateAirportResponse,
  ) {}
}

@CommandHandler(UpdateAirportCommand)
export class UpdateAirportHandler implements ICommandHandler<UpdateAirportCommand> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(command: UpdateAirportCommand): Promise<void> {
    const { airportId, data } = command;
    await this.repository.update(airportId, data);
  }
}
