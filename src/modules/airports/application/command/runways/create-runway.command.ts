import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRunwayRequest } from '../../../infra/http/request/runway.dto';
import { RunwaysRepository } from '../../../infra/database/runways.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';

export class CreateRunwayCommand {
  constructor(
    public readonly airportId: string,
    public readonly runwayId: string,
    public readonly data: CreateRunwayRequest,
  ) {}
}

@CommandHandler(CreateRunwayCommand)
export class CreateRunwayHandler implements ICommandHandler<CreateRunwayCommand> {
  constructor(
    private readonly runwaysRepository: RunwaysRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: CreateRunwayCommand): Promise<void> {
    const { airportId, runwayId, data } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    await this.runwaysRepository.create(airportId, runwayId, data);
  }
}
