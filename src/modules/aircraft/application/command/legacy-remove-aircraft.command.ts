import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../operators/infra/database/repository/aircraft.repository';
import {
  AircraftInUseError,
  AircraftNotFoundError,
} from '../../../operators/model/error/aircraft.error';

export class LegacyRemoveAircraftCommand {
  constructor(public readonly aircraftId: string) {}
}

@CommandHandler(LegacyRemoveAircraftCommand)
export class LegacyRemoveAircraftHandler implements ICommandHandler<LegacyRemoveAircraftCommand> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(command: LegacyRemoveAircraftCommand): Promise<void> {
    const { aircraftId } = command;

    const aircraft = await this.repository.legacyFindOneBy({ id: aircraftId });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    const connectedFlights = await this.repository.countFlights(aircraftId);

    if (connectedFlights > 0) {
      throw new AircraftInUseError();
    }

    await this.repository.remove(aircraftId);
  }
}
