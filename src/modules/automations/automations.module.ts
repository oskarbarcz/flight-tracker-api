import { Module } from '@nestjs/common';
import { DelayAutoApprovalService } from './infra/service/delay-auto-approval.service';

@Module({
  providers: [DelayAutoApprovalService],
})
export class AutomationsModule {}
