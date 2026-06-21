import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightEventType } from '../../../../../core/events/flight';
import { FlightEventScope } from '../../../model/event.model';
import { NewFlightEvent } from '../../../infra/http/request/event.dto';
import { DelayRepository } from '../../../infra/database/repository/delay.repository';
import { DelayReportStatus } from '../../../model/delay-report.model';
import {
  DelayReportAlreadyAcceptedError,
  DelayReportNotFoundError,
} from '../../../model/error/delay.error';

export class AcceptDelayReportCommand {
  constructor(
    public readonly flightId: string,
    public readonly reportId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(AcceptDelayReportCommand)
export class AcceptDelayReportHandler implements ICommandHandler<
  AcceptDelayReportCommand,
  void
> {
  constructor(
    private readonly delayRepository: DelayRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: AcceptDelayReportCommand): Promise<void> {
    const { flightId, reportId, userId } = command;

    const report = await this.delayRepository.findReport(flightId, reportId);
    if (!report) {
      throw new DelayReportNotFoundError();
    }
    if (report.status === DelayReportStatus.accepted) {
      throw new DelayReportAlreadyAcceptedError();
    }

    await this.delayRepository.decideReport(
      reportId,
      DelayReportStatus.accepted,
      userId,
      null,
    );

    const event: NewFlightEvent = {
      flightId,
      type: FlightEventType.DelayReportWasAccepted,
      scope: FlightEventScope.Operations,
      actorId: userId,
    };
    this.eventEmitter.emit(FlightEventType.DelayReportWasAccepted, event);
  }
}
