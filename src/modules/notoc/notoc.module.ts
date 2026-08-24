import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { GetFlightNotocAction } from './infra/http/action/get-flight-notoc.action';
import { IssueNotocHandler } from './application/command/issue-notoc.command';
import { AcknowledgeNotocHandler } from './application/command/acknowledge-notoc.command';
import { GetFlightNotocHandler } from './application/query/get-flight-notoc.query';
import { GetFlightNotocSummaryHandler } from './application/query/get-flight-notoc-summary.query';
import { NotocRepository } from './infra/database/repository/notoc.repository';

@Module({
  imports: [PrismaModule],
  controllers: [GetFlightNotocAction],
  providers: [
    NotocRepository,
    IssueNotocHandler,
    AcknowledgeNotocHandler,
    GetFlightNotocHandler,
    GetFlightNotocSummaryHandler,
  ],
})
export class NotocModule {}
