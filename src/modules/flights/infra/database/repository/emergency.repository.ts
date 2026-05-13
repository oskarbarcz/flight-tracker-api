import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { Prisma } from 'prisma/client/client';
import { Coordinates } from '../../../../airports/model/airport.model';
import {
  DangerousGoodsClass,
  EmergencyCategory,
  EmergencyIntention,
  EmergencyThreatLevel,
  EmergencyUrgency,
  SquawkCode,
} from '../../../model/emergency.model';
import {
  GetEmergencyResponse,
  UpdateEmergencyRequest,
} from '../../http/request/emergency.dto';

export type EmergencyCreateInput = {
  urgency: EmergencyUrgency;
  threatLevel: EmergencyThreatLevel;
  category: EmergencyCategory;
  squawk?: SquawkCode | null;
  intention: EmergencyIntention;
  lastKnownPosition?: Coordinates | null;
  soulsOnBoard: number;
  fuelEnduranceMinutes: number;
  dangerousGoodsOnBoard: DangerousGoodsClass[];
  freeText: string;
  reportedBy: string;
};

const participantSelect = {
  select: {
    id: true,
    name: true,
  },
} as const;

const emergencyWithRelations = {
  id: true,
  urgency: true,
  threatLevel: true,
  category: true,
  squawk: true,
  intention: true,
  lastKnownPosition: true,
  soulsOnBoard: true,
  fuelEnduranceMinutes: true,
  dangerousGoodsOnBoard: true,
  freeText: true,
  declarationTime: true,
  resolvedAt: true,
  reporter: participantSelect,
  resolver: participantSelect,
} as const satisfies Prisma.EmergencyDeclarationSelect;

type RawEmergency = Prisma.EmergencyDeclarationGetPayload<{
  select: typeof emergencyWithRelations;
}>;

const toResponse = ({
  reporter,
  resolver,
  ...row
}: RawEmergency): GetEmergencyResponse => ({
  ...row,
  urgency: row.urgency as EmergencyUrgency,
  threatLevel: row.threatLevel as EmergencyThreatLevel,
  category: row.category as EmergencyCategory,
  squawk: row.squawk as SquawkCode | null,
  intention: row.intention as EmergencyIntention,
  lastKnownPosition: row.lastKnownPosition as unknown as Coordinates | null,
  dangerousGoodsOnBoard: row.dangerousGoodsOnBoard as DangerousGoodsClass[],
  reportedBy: reporter,
  resolvedBy: resolver,
});

@Injectable()
export class EmergencyRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    flightId: string,
    data: EmergencyCreateInput,
  ): Promise<GetEmergencyResponse> {
    const row = await this.prisma.emergencyDeclaration.create({
      data: {
        flightId,
        reportedBy: data.reportedBy,
        urgency: data.urgency,
        threatLevel: data.threatLevel,
        category: data.category,
        squawk: data.squawk ?? null,
        intention: data.intention,
        lastKnownPosition: data.lastKnownPosition
          ? (data.lastKnownPosition as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        soulsOnBoard: data.soulsOnBoard,
        fuelEnduranceMinutes: data.fuelEnduranceMinutes,
        dangerousGoodsOnBoard: data.dangerousGoodsOnBoard,
        freeText: data.freeText,
      },
      select: emergencyWithRelations,
    });

    return toResponse(row);
  }

  public async update(
    emergencyId: string,
    patch: UpdateEmergencyRequest,
  ): Promise<void> {
    const data: Prisma.EmergencyDeclarationUpdateInput = {};

    if (patch.urgency !== undefined) data.urgency = patch.urgency;
    if (patch.threatLevel !== undefined) data.threatLevel = patch.threatLevel;
    if (patch.category !== undefined) data.category = patch.category;
    if (patch.squawk !== undefined) data.squawk = patch.squawk;
    if (patch.intention !== undefined) data.intention = patch.intention;
    if (patch.lastKnownPosition !== undefined) {
      data.lastKnownPosition = patch.lastKnownPosition
        ? (patch.lastKnownPosition as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    }
    if (patch.fuelEnduranceMinutes !== undefined) {
      data.fuelEnduranceMinutes = patch.fuelEnduranceMinutes;
    }
    if (patch.dangerousGoodsOnBoard !== undefined) {
      data.dangerousGoodsOnBoard = patch.dangerousGoodsOnBoard;
    }
    if (patch.freeText !== undefined) data.freeText = patch.freeText;

    await this.prisma.emergencyDeclaration.update({
      where: { id: emergencyId },
      data,
    });
  }

  public async resolve(emergencyId: string, resolvedBy: string): Promise<void> {
    await this.prisma.emergencyDeclaration.update({
      where: { id: emergencyId },
      data: {
        resolvedAt: new Date(),
        resolvedBy,
      },
    });
  }

  public async findById(
    flightId: string,
    emergencyId: string,
  ): Promise<{ id: string; resolvedAt: Date | null } | null> {
    return this.prisma.emergencyDeclaration.findFirst({
      where: { id: emergencyId, flightId },
      select: { id: true, resolvedAt: true },
    });
  }

  public async hasUnresolved(flightId: string): Promise<boolean> {
    const count = await this.prisma.emergencyDeclaration.count({
      where: { flightId, resolvedAt: null },
    });
    return count > 0;
  }

  public async listForFlight(
    flightId: string,
  ): Promise<GetEmergencyResponse[]> {
    const rows = await this.prisma.emergencyDeclaration.findMany({
      where: { flightId },
      select: emergencyWithRelations,
      orderBy: { declarationTime: 'desc' },
    });

    return rows.map(toResponse);
  }
}
