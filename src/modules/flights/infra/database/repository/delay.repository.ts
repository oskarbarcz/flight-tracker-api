import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/client/client';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { DelayReasonCode } from '../../../model/delay-reason-code.model';
import { DelayReportStatus } from '../../../model/delay-report.model';
import { DelayRequestStatus } from '../../../model/delay-request.model';
import {
  GetDelayReportResponse,
  GetDelayRequestResponse,
} from '../../http/request/delay.dto';

const participantSelect = {
  select: {
    id: true,
    name: true,
  },
} as const;

const entryWithRelations = {
  id: true,
  delayMinutes: true,
  reasonCode: true,
  freeText: true,
  status: true,
  rejectionReason: true,
  decidedAt: true,
  createdAt: true,
  reportedBy: participantSelect,
  decidedBy: participantSelect,
} as const satisfies Prisma.DelayReportSelect;

const requestWithRelations = {
  id: true,
  flightId: true,
  totalDelayMinutes: true,
  createdAt: true,
  reports: {
    select: entryWithRelations,
    orderBy: { createdAt: 'asc' },
  },
} as const satisfies Prisma.DelayRequestSelect;

type RawEntry = Prisma.DelayReportGetPayload<{
  select: typeof entryWithRelations;
}>;
type RawRequest = Prisma.DelayRequestGetPayload<{
  select: typeof requestWithRelations;
}>;

const toEntryResponse = (row: RawEntry): GetDelayReportResponse => ({
  id: row.id,
  delayMinutes: row.delayMinutes,
  reasonCode: row.reasonCode as DelayReasonCode,
  freeText: row.freeText,
  status: row.status as DelayReportStatus,
  reportedBy: row.reportedBy,
  decidedBy: row.decidedBy,
  rejectionReason: row.rejectionReason,
  decidedAt: row.decidedAt,
  createdAt: row.createdAt,
});

const toRequestResponse = (row: RawRequest): GetDelayRequestResponse => {
  const reports = row.reports.map(toEntryResponse);
  const allocatedMinutes = reports.reduce((sum, e) => sum + e.delayMinutes, 0);
  const isReconciled = allocatedMinutes === row.totalDelayMinutes;
  const isSettled =
    reports.length > 0 &&
    reports.every((e) => e.status === DelayReportStatus.accepted) &&
    isReconciled;

  return {
    id: row.id,
    flightId: row.flightId,
    totalDelayMinutes: row.totalDelayMinutes,
    allocatedMinutes,
    isReconciled,
    isSettled,
    reports,
    createdAt: row.createdAt,
  };
};

@Injectable()
export class DelayRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findByFlightId(
    flightId: string,
  ): Promise<GetDelayRequestResponse | null> {
    const row = await this.prisma.delayRequest.findUnique({
      where: { flightId },
      select: requestWithRelations,
    });

    return row ? toRequestResponse(row) : null;
  }

  public async createPending(
    flightId: string,
    totalDelayMinutes: number,
  ): Promise<void> {
    await this.prisma.delayRequest.create({
      data: { flightId, totalDelayMinutes },
    });
  }

  public async findReport(
    flightId: string,
    reportId: string,
  ): Promise<{ id: string; status: DelayReportStatus } | null> {
    const report = await this.prisma.delayReport.findFirst({
      where: { id: reportId, request: { flightId } },
      select: { id: true, status: true },
    });

    return report
      ? { id: report.id, status: report.status as DelayReportStatus }
      : null;
  }

  public async addReport(
    requestId: string,
    data: {
      delayMinutes: number;
      reasonCode: DelayReasonCode;
      freeText?: string | null;
      reportedById: string;
    },
  ): Promise<void> {
    await this.prisma.delayReport.create({
      data: {
        requestId,
        delayMinutes: data.delayMinutes,
        reasonCode: data.reasonCode,
        freeText: data.freeText ?? null,
        reportedById: data.reportedById,
      },
    });
  }

  public async removeReport(reportId: string): Promise<void> {
    await this.prisma.delayReport.delete({ where: { id: reportId } });
  }

  public async decideReport(
    reportId: string,
    status:
      | typeof DelayReportStatus.accepted
      | typeof DelayReportStatus.rejected,
    decidedById: string,
    rejectionReason: string | null,
  ): Promise<void> {
    await this.prisma.delayReport.update({
      where: { id: reportId },
      data: { status, decidedById, rejectionReason, decidedAt: new Date() },
    });
  }

  public async list(
    status?: DelayRequestStatus,
  ): Promise<GetDelayRequestResponse[]> {
    const rows = await this.prisma.delayRequest.findMany({
      select: requestWithRelations,
      orderBy: { createdAt: 'asc' },
    });

    const requests = rows.map(toRequestResponse);

    if (status === DelayRequestStatus.Pending) {
      return requests.filter((request) => !request.isSettled);
    }
    if (status === DelayRequestStatus.Settled) {
      return requests.filter((request) => request.isSettled);
    }
    return requests;
  }
}
