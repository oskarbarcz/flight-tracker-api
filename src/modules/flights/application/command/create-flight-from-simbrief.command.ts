import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { FlightsRepository } from '../../repository/flights.repository';
import { NewFlightEvent } from '../../dto/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../entity/event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GetUserSimbriefIdQuery } from '../../../users/application/query/get-user-simbrief-id.query';
import { SimbriefClient } from '../../../../core/provider/simbrief/client/simbrief.client';

export class CreateFlightFromSimbriefCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(CreateFlightFromSimbriefCommand)
export class CreateFlightFromSimbriefHandler implements ICommandHandler<CreateFlightFromSimbriefCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly simbriefClient: SimbriefClient,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateFlightFromSimbriefCommand): Promise<void> {
    const { flightId, initiatorId } = command;

    const getSimbriefIdQuery = new GetUserSimbriefIdQuery(initiatorId);
    const simbriefId = await this.queryBus.execute(getSimbriefIdQuery);

    if (simbriefId === null) {
      throw new BadRequestException('Simbrief ID is not linked to a user');
    }

    const ofp = await this.simbriefClient.getOperationalFlightPlan(simbriefId);

    console.log(ofp);

    // await this.flightsRepository.create(flightId, flightData);

    const event: NewFlightEvent = {
      flightId: flightId,
      type: FlightEventType.FlightWasCreated,
      scope: FlightEventScope.Operations,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.FlightWasCreated, event);
  }
}
