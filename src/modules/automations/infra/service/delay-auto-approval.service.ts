import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AcceptDelayReportCommand } from '../../../flights/application/command/delay/accept-delay-report.command';
import { ListDelayRequestsQuery } from '../../../flights/application/query/delay/list-delay-requests.query';
import { GetDelayRequestResponse } from '../../../flights/infra/http/request/delay.dto';
import { DelayReportStatus } from '../../../flights/model/delay-report.model';
import { DelayRequestStatus } from '../../../flights/model/delay-request.model';
import {
  AUTO_APPROVAL_MAX_AGE_MINUTES,
  autoApprovalDeadlineMinutes,
} from '../../model/delay-auto-approval.constants';

@Injectable()
export class DelayAutoApprovalService {
  private readonly logger = new Logger(DelayAutoApprovalService.name);
  private readonly operatorId: string;

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    config: ConfigService,
  ) {
    this.operatorId = config.get<string>('AUTO_APPROVE_OPERATOR_ID') as string;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async autoApproveStaleDelays(): Promise<void> {
    const query = new ListDelayRequestsQuery(DelayRequestStatus.Pending);
    const requests: GetDelayRequestResponse[] =
      await this.queryBus.execute(query);

    for (const request of requests) {
      const ageMinutes =
        (Date.now() - new Date(request.createdAt).getTime()) / 60_000;

      if (
        ageMinutes < autoApprovalDeadlineMinutes(request.id) ||
        ageMinutes > AUTO_APPROVAL_MAX_AGE_MINUTES
      ) {
        continue;
      }

      const pending = request.reports.filter(
        (report) => report.status === DelayReportStatus.pending,
      );
      if (pending.length === 0) {
        continue;
      }

      for (const report of pending) {
        const command = new AcceptDelayReportCommand(
          request.flightId,
          report.id,
          this.operatorId,
        );
        await this.commandBus.execute(command);
      }

      this.logger.log(
        `Auto-approved ${pending.length} pending delay report(s) for flight ${request.flightId}.`,
      );
    }
  }
}
