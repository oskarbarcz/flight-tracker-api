import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  OperatorContainsAircraftError,
  OperatorContainsFlightsError,
  OperatorDoesNotExistsError,
} from '../../dto/errors';
import { OperatorsRepository } from '../../repository/operators.repository';

export class RemoveOperatorCommand {
  constructor(public readonly operatorId: string) {}
}

@CommandHandler(RemoveOperatorCommand)
export class RemoveOperatorHandler implements ICommandHandler<RemoveOperatorCommand> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(command: RemoveOperatorCommand): Promise<void> {
    const { operatorId } = command;

    const operator = await this.repository.findOneBy({ id: operatorId });

    if (!operator) {
      throw new NotFoundException(OperatorDoesNotExistsError);
    }

    const flightsCount = await this.repository.countFlights(operatorId);

    if (flightsCount > 0) {
      throw new BadRequestException(OperatorContainsFlightsError);
    }

    const aircraftCount = await this.repository.countAircraft(operatorId);

    if (aircraftCount > 0) {
      throw new BadRequestException(OperatorContainsAircraftError);
    }

    await this.repository.remove(operatorId);
  }
}
