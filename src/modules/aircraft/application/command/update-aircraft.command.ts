import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import { UpdateAircraftRequest } from '../../infra/http/request/aircraft.request';
import { AircraftNotFoundError } from '../../model/error/aircraft.error';
import { findAirframeByType } from '../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../airframes/model/error/airframe.error';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { AircraftEditedEvent } from '../../../../core/domain/events/dto/aircraft.event';
import { AssertAirportExistsQuery } from '../../../airports/application/assert/assert-airport-exists.query';

export class UpdateAircraftCommand {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
    public readonly data: UpdateAircraftRequest,
  ) {}
}

@CommandHandler(UpdateAircraftCommand)
export class UpdateAircraftHandler implements ICommandHandler<UpdateAircraftCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly domainEvents: DomainEventEmitter,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: UpdateAircraftCommand): Promise<void> {
    const { operatorId, aircraftId, data } = command;

    const operatorQuery = new AssertOperatorExistsQuery(operatorId);
    await this.queryBus.execute(operatorQuery);

    const aircraft = await this.aircraftRepository.findOneBy({
      id: aircraftId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    if (data.type !== undefined && !findAirframeByType(data.type)) {
      throw new AirframeNotFoundError();
    }

    if (data.baseAirportId) {
      const airportQuery = new AssertAirportExistsQuery(data.baseAirportId);
      await this.queryBus.execute(airportQuery);
    }

    await this.aircraftRepository.update(aircraftId, data);
    await this.domainEvents.emitAsync(
      new AircraftEditedEvent({ aircraftId, operatorId }),
    );
  }
}
