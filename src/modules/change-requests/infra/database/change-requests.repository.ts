import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/client/client';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import {
  AnyChangeRequest,
  ChangeRequestChanges,
  ChangeRequestResource,
  ChangeRequestStatus,
} from '../../model/change-request.model';

const participantSelect = {
  select: {
    id: true,
    name: true,
  },
} as const;

const selectChangeRequest = {
  id: true,
  resource: true,
  targetId: true,
  payload: true,
  status: true,
  rejectionReason: true,
  decidedAt: true,
  createdAt: true,
  requestedBy: participantSelect,
  decidedBy: participantSelect,
} as const satisfies Prisma.ChangeRequestSelect;

type RawChangeRequest = Prisma.ChangeRequestGetPayload<{
  select: typeof selectChangeRequest;
}>;

const toChangeRequest = (row: RawChangeRequest): AnyChangeRequest =>
  ({
    id: row.id,
    resource: row.resource,
    targetId: row.targetId,
    changes: row.payload,
    status: row.status,
    requestedBy: row.requestedBy,
    decidedBy: row.decidedBy,
    rejectionReason: row.rejectionReason,
    decidedAt: row.decidedAt,
    createdAt: row.createdAt,
  }) as AnyChangeRequest;

export type ChangeRequestFilters = {
  status?: ChangeRequestStatus;
  resource?: ChangeRequestResource;
};

type Decision =
  | {
      status: typeof ChangeRequestStatus.accepted;
      decidedById: string;
      appliedSnapshot: object;
    }
  | {
      status: typeof ChangeRequestStatus.rejected;
      decidedById: string;
      rejectionReason: string;
    }
  | { status: typeof ChangeRequestStatus.withdrawn };

@Injectable()
export class ChangeRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create<R extends ChangeRequestResource>(data: {
    resource: R;
    targetId: string;
    changes: ChangeRequestChanges<R>;
    requestedById: string;
  }): Promise<string> {
    const { id } = await this.prisma.changeRequest.create({
      data: {
        resource: data.resource,
        targetId: data.targetId,
        payload: data.changes as Prisma.InputJsonObject,
        requestedById: data.requestedById,
      },
      select: { id: true },
    });

    return id;
  }

  async findById(id: string): Promise<AnyChangeRequest | null> {
    const row = await this.prisma.changeRequest.findUnique({
      where: { id },
      select: selectChangeRequest,
    });

    return row ? toChangeRequest(row) : null;
  }

  async list(filters: ChangeRequestFilters): Promise<AnyChangeRequest[]> {
    const rows = await this.prisma.changeRequest.findMany({
      where: { status: filters.status, resource: filters.resource },
      select: selectChangeRequest,
      orderBy: { createdAt: 'asc' },
    });

    return rows.map(toChangeRequest);
  }

  async listByRequester(
    requestedById: string,
    filters: Pick<ChangeRequestFilters, 'status'>,
  ): Promise<AnyChangeRequest[]> {
    const rows = await this.prisma.changeRequest.findMany({
      where: { requestedById, status: filters.status },
      select: selectChangeRequest,
      orderBy: { createdAt: 'desc' },
    });

    return rows.map(toChangeRequest);
  }

  async transition(id: string, decision: Decision): Promise<boolean> {
    const data: Prisma.ChangeRequestUncheckedUpdateManyInput = {
      status: decision.status,
      decidedAt: new Date(),
    };

    if (decision.status !== ChangeRequestStatus.withdrawn) {
      data.decidedById = decision.decidedById;
    }
    if (decision.status === ChangeRequestStatus.accepted) {
      data.appliedSnapshot = decision.appliedSnapshot as Prisma.InputJsonObject;
    }
    if (decision.status === ChangeRequestStatus.rejected) {
      data.rejectionReason = decision.rejectionReason;
    }

    const { count } = await this.prisma.changeRequest.updateMany({
      where: { id, status: ChangeRequestStatus.pending },
      data,
    });

    return count === 1;
  }
}
