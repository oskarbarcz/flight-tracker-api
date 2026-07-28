import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import {
  AircraftEventType,
  AircraftCreatedEvent,
  AircraftEditedEvent,
  AircraftRemovedEvent,
} from '../../../../../core/domain/events/dto/aircraft.event';
import {
  GetOperatorFleetSummaryQuery,
  OperatorFleetSummary,
} from '../../../../aircraft/application/query/get-operator-fleet-summary.query';

@Injectable()
export class AircraftLifecycleListener {
  constructor(
    private readonly operatorsRepository: OperatorsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  @OnEvent(AircraftEventType.AircraftWasCreated)
  @OnEvent(AircraftEventType.AircraftWasEdited)
  @OnEvent(AircraftEventType.AircraftWasRemoved)
  async updateFleet(
    event: AircraftCreatedEvent | AircraftEditedEvent | AircraftRemovedEvent,
  ): Promise<void> {
    const { operatorId } = event.payload;

    const query = new GetOperatorFleetSummaryQuery(operatorId);
    const { fleetSize, fleetTypes }: OperatorFleetSummary =
      await this.queryBus.execute(query);

    await this.operatorsRepository.updateFleet(
      operatorId,
      fleetSize,
      fleetTypes,
    );
  }
}
