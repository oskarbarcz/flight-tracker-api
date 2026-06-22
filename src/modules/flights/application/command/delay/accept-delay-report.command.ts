import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';
import { DelayReportWasAcceptedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';
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
    private readonly domainEvents: DomainEventEmitter,
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

    this.domainEvents.emit(
      new DelayReportWasAcceptedEvent({
        flightId,
        scope: FlightEventScope.Operations,
        actorId: userId,
      }),
    );
  }
}
