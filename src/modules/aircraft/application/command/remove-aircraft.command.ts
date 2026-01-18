import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AircraftInUseError } from '../../dto/errors.dto';
import { AircraftRepository } from '../../repository/aircraft.repository';

export class RemoveAircraftCommand {
  constructor(public readonly aircraftId: string) {}
}

@CommandHandler(RemoveAircraftCommand)
export class RemoveAircraftHandler implements ICommandHandler<RemoveAircraftCommand> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(command: RemoveAircraftCommand): Promise<void> {
    const { aircraftId } = command;

    const aircraft = await this.repository.findOneBy({ id: aircraftId });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    const connectedFlights = await this.repository.countFlights(aircraftId);

    if (connectedFlights > 0) {
      throw new BadRequestException(AircraftInUseError);
    }

    await this.repository.remove(aircraftId);
  }
}
