import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OperatorForAircraftNotFoundError } from '../../dto/errors.dto';
import { AircraftRepository } from '../../repository/aircraft.repository';
import { CreateAircraftRequest } from '../../dto/create-aircraft.dto';
import { CheckOperatorExistsQuery } from '../../../operators/application/query/check-operator-exists.query';

export class CreateAircraftCommand {
  constructor(
    public readonly aircraftId: string,
    public readonly data: CreateAircraftRequest,
  ) {}
}

@CommandHandler(CreateAircraftCommand)
export class CreateAircraftHandler implements ICommandHandler<CreateAircraftCommand> {
  constructor(
    private readonly repository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateAircraftCommand): Promise<void> {
    const { aircraftId, data } = command;

    const existing = await this.repository.findOneBy({
      registration: data.registration,
    });

    if (existing) {
      throw new BadRequestException(
        'Aircraft with given registration already exists.',
      );
    }

    const operatorExists = await this.queryBus.execute(
      new CheckOperatorExistsQuery(data.operatorId),
    );

    if (!operatorExists) {
      throw new NotFoundException(OperatorForAircraftNotFoundError);
    }

    await this.repository.create(aircraftId, data);
  }
}
