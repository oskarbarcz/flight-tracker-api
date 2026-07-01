import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import {
  AircraftInUseError,
  AircraftNotFoundError,
} from '../../../model/error/aircraft.error';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';
import { AircraftRemovedEvent } from '../../../../../core/domain/events/dto/aircraft.event';

export class RemoveAircraftCommand {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
  ) {}
}

@CommandHandler(RemoveAircraftCommand)
export class RemoveAircraftHandler implements ICommandHandler<RemoveAircraftCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly operatorsRepository: OperatorsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: RemoveAircraftCommand): Promise<void> {
    const { operatorId, aircraftId } = command;

    const operatorExists = await this.operatorsRepository.exists(
      command.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    const aircraft = await this.aircraftRepository.findOneBy({
      id: aircraftId,
      operatorId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    const connectedFlights =
      await this.aircraftRepository.countFlights(aircraftId);

    if (connectedFlights > 0) {
      throw new AircraftInUseError();
    }

    await this.aircraftRepository.remove(aircraftId);
    await this.domainEvents.emitAsync(
      new AircraftRemovedEvent({ aircraftId, operatorId }),
    );
  }
}
