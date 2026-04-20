import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RunwaysRepository } from '../../../infra/database/runways.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { RunwayNotFoundError } from '../../../model/error/runway.error';

export class RemoveRunwayCommand {
  constructor(
    public readonly airportId: string,
    public readonly runwayId: string,
  ) {}
}

@CommandHandler(RemoveRunwayCommand)
export class RemoveRunwayHandler implements ICommandHandler<RemoveRunwayCommand> {
  constructor(
    private readonly runwaysRepository: RunwaysRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: RemoveRunwayCommand): Promise<void> {
    const { airportId, runwayId } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.runwaysRepository.exists(airportId, runwayId))) {
      throw new RunwayNotFoundError();
    }

    await this.runwaysRepository.remove(runwayId);
  }
}
