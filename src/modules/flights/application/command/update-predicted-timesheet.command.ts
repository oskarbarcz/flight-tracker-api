import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToPredictArrivalError,
  InvalidStatusToPredictOffBlockError,
  InvalidStatusToPredictOnBlockError,
  InvalidStatusToPredictTakeoffError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import {
  FullTimesheet,
  Schedule,
  mergeSchedulePatch,
} from '../../model/timesheet.model';
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { scopeForActor } from '../../model/event.model';
import { JwtUser } from '../../../auth/infra/http/request/jwt-user.dto';
import { UpdatePredictedTimesheetRequest } from '../../infra/http/request/flight.dto';

type PredictableField = keyof Pick<
  Schedule,
  'offBlockTime' | 'takeoffTime' | 'arrivalTime' | 'onBlockTime'
>;

const fieldGuards: ReadonlyArray<{
  field: PredictableField;
  forbiddenFrom: FlightStatus;
  error: new () => Error;
}> = [
  {
    field: 'offBlockTime',
    forbiddenFrom: FlightStatus.TaxiingOut,
    error: InvalidStatusToPredictOffBlockError,
  },
  {
    field: 'takeoffTime',
    forbiddenFrom: FlightStatus.InCruise,
    error: InvalidStatusToPredictTakeoffError,
  },
  {
    field: 'arrivalTime',
    forbiddenFrom: FlightStatus.TaxiingIn,
    error: InvalidStatusToPredictArrivalError,
  },
  {
    field: 'onBlockTime',
    forbiddenFrom: FlightStatus.OnBlock,
    error: InvalidStatusToPredictOnBlockError,
  },
];

// Status order along the flight lifecycle; index comparison drives the
// per-field gating ("forbidden once status reaches X").
const statusOrder: FlightStatus[] = [
  FlightStatus.Created,
  FlightStatus.Ready,
  FlightStatus.CheckedIn,
  FlightStatus.BoardingStarted,
  FlightStatus.BoardingFinished,
  FlightStatus.TaxiingOut,
  FlightStatus.InCruise,
  FlightStatus.TaxiingIn,
  FlightStatus.OnBlock,
  FlightStatus.OffboardingStarted,
  FlightStatus.OffboardingFinished,
  FlightStatus.Closed,
];

const statusReached = (current: FlightStatus, target: FlightStatus): boolean =>
  statusOrder.indexOf(current) >= statusOrder.indexOf(target);

export class UpdatePredictedTimesheetCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly patch: UpdatePredictedTimesheetRequest,
  ) {}
}

@CommandHandler(UpdatePredictedTimesheetCommand)
export class UpdatePredictedTimesheetHandler implements ICommandHandler<UpdatePredictedTimesheetCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdatePredictedTimesheetCommand): Promise<void> {
    const { flightId, actor, patch } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const status = flight.status as FlightStatus;
    for (const guard of fieldGuards) {
      if (patch[guard.field] === undefined) continue;
      if (statusReached(status, guard.forbiddenFrom)) {
        throw new guard.error();
      }
    }

    const currentTimesheet = (flight.timesheet ?? {}) as FullTimesheet;
    const nextTimesheet: FullTimesheet = {
      ...currentTimesheet,
      predicted: mergeSchedulePatch(currentTimesheet.predicted, patch),
    };
    await this.flightsRepository.updateTimesheet(flightId, nextTimesheet);

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.PredictedTimesheetWasUpdated,
      scope: scopeForActor(actor),
      actorId: actor.sub,
    };
    this.eventEmitter.emit(FlightEventType.PredictedTimesheetWasUpdated, event);
  }
}
