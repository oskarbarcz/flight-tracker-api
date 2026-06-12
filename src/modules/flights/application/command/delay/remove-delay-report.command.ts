import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DelayRepository } from '../../../infra/database/repository/delay.repository';
import { DelayReportStatus } from '../../../model/delay-report.model';
import {
  DelayReportAlreadyAcceptedError,
  DelayReportNotFoundError,
} from '../../../model/error/delay.error';

export class RemoveDelayReportCommand {
  constructor(
    public readonly flightId: string,
    public readonly reportId: string,
  ) {}
}

@CommandHandler(RemoveDelayReportCommand)
export class RemoveDelayReportHandler implements ICommandHandler<
  RemoveDelayReportCommand,
  void
> {
  constructor(private readonly delayRepository: DelayRepository) {}

  async execute(command: RemoveDelayReportCommand): Promise<void> {
    const { flightId, reportId } = command;

    const report = await this.delayRepository.findReport(flightId, reportId);
    if (!report) {
      throw new DelayReportNotFoundError();
    }
    if (report.status === DelayReportStatus.accepted) {
      throw new DelayReportAlreadyAcceptedError();
    }

    await this.delayRepository.removeReport(reportId);
  }
}
