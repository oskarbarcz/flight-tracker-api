import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';
import { DelayReportWasRejectedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { scopeForActor } from '../../../model/event.model';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import { DelayRepository } from '../../../infra/database/repository/delay.repository';
import { DelayReportStatus } from '../../../model/delay-report.model';
import {
  DelayReportAlreadyAcceptedError,
  DelayReportNotFoundError,
} from '../../../model/error/delay.error';

export class RejectDelayReportCommand {
  constructor(
    public readonly flightId: string,
    public readonly reportId: string,
    public readonly actor: JwtUser,
    public readonly rejectionReason: string,
  ) {}
}

@CommandHandler(RejectDelayReportCommand)
export class RejectDelayReportHandler implements ICommandHandler<
  RejectDelayReportCommand,
  void
> {
  constructor(
    private readonly delayRepository: DelayRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: RejectDelayReportCommand): Promise<void> {
    const { flightId, reportId, actor, rejectionReason } = command;

    const report = await this.delayRepository.findReport(flightId, reportId);
    if (!report) {
      throw new DelayReportNotFoundError();
    }
    if (report.status === DelayReportStatus.accepted) {
      throw new DelayReportAlreadyAcceptedError();
    }

    await this.delayRepository.decideReport(
      reportId,
      DelayReportStatus.rejected,
      actor.sub,
      rejectionReason,
    );

    this.domainEvents.emit(
      new DelayReportWasRejectedEvent({
        flightId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
