import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRunwayRequest } from '../../../infra/http/request/runway.dto';
import { RunwaysRepository } from '../../../infra/database/runways.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { RunwayNotFoundError } from '../../../model/error/runway.error';

export class UpdateRunwayCommand {
  constructor(
    public readonly airportId: string,
    public readonly runwayId: string,
    public readonly data: UpdateRunwayRequest,
  ) {}
}

@CommandHandler(UpdateRunwayCommand)
export class UpdateRunwayHandler implements ICommandHandler<UpdateRunwayCommand> {
  constructor(
    private readonly runwaysRepository: RunwaysRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: UpdateRunwayCommand): Promise<void> {
    const { airportId, runwayId, data } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.runwaysRepository.exists(airportId, runwayId))) {
      throw new RunwayNotFoundError();
    }

    await this.runwaysRepository.update(runwayId, data);
  }
}
