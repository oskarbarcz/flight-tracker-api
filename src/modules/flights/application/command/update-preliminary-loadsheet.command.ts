import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateLoadsheetError,
} from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { Loadsheet, Loadsheets } from '../../model/loadsheet.model';
import { PreliminaryLoadsheetWasUpdatedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import {
  assertFuelBreakdownConsistent,
  assertPassengerBreakdownConsistent,
} from '../../model/loadsheet.policy';
import { GetSeatCapacityQuery } from '../../../passengers/application/query/get-seat-capacity.query';
import { SeatCapacityExceededError } from '../../../passengers/model/error/manifest.error';

export class UpdatePreliminaryLoadsheetCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly loadsheet: Loadsheet,
  ) {}
}

@CommandHandler(UpdatePreliminaryLoadsheetCommand)
export class UpdatePreliminaryLoadsheetHandler implements ICommandHandler<UpdatePreliminaryLoadsheetCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdatePreliminaryLoadsheetCommand): Promise<void> {
    const { flightId, initiatorId, loadsheet } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.Created) {
      throw new InvalidStatusToUpdateLoadsheetError();
    }

    assertFuelBreakdownConsistent(loadsheet);
    assertPassengerBreakdownConsistent(loadsheet);

    const capacityQuery = new GetSeatCapacityQuery(flight.aircraft.id);
    const capacity: number | null = await this.queryBus.execute(capacityQuery);

    if (capacity !== null && loadsheet.passengers > capacity) {
      throw new SeatCapacityExceededError(loadsheet.passengers, capacity);
    }

    const loadsheets: Loadsheets = {
      preliminary: loadsheet,
      final: flight.loadsheets.final,
    };
    await this.flightsRepository.updateLoadsheets(flightId, loadsheets);
    this.domainEvents.emit(
      new PreliminaryLoadsheetWasUpdatedEvent({
        flightId,
        scope: FlightEventScope.Operations,
        actorId: initiatorId,
      }),
    );
  }
}
