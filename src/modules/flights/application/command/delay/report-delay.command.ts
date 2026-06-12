import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightEventType } from '../../../../../core/events/flight';
import { scopeForActor } from '../../../model/event.model';
import { NewFlightEvent } from '../../../infra/http/request/event.dto';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import { DelayRepository } from '../../../infra/database/repository/delay.repository';
import { ReportDelayRequest } from '../../../infra/http/request/delay.dto';
import { DelayRequestNotFoundError } from '../../../model/error/delay.error';

export class ReportDelayCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly payload: ReportDelayRequest,
  ) {}
}

@CommandHandler(ReportDelayCommand)
export class ReportDelayHandler implements ICommandHandler<
  ReportDelayCommand,
  void
> {
  constructor(
    private readonly delayRepository: DelayRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ReportDelayCommand): Promise<void> {
    const { flightId, actor, payload } = command;

    const request = await this.delayRepository.findByFlightId(flightId);
    if (!request) {
      throw new DelayRequestNotFoundError();
    }

    await this.delayRepository.addReport(request.id, {
      delayMinutes: payload.delayMinutes,
      reasonCode: payload.reasonCode,
      freeText: payload.freeText,
      reportedById: actor.sub,
    });

    const event: NewFlightEvent = {
      flightId,
      type: FlightEventType.DelayReportWasFiled,
      scope: scopeForActor(actor),
      actorId: actor.sub,
    };
    this.eventEmitter.emit(FlightEventType.DelayReportWasFiled, event);
  }
}
