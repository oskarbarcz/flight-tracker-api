import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import { ReportDiversionRequest } from '../dto/diversion.dto';
import { Prisma, UserRole } from '@prisma/client';
import { JwtUser } from '../../auth/dto/jwt-user.dto';
import { DiversionReporterRole } from '../entity/diversion.entity';

@Injectable()
export class DiversionRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    flightId: string,
    currentUser: JwtUser,
    data: ReportDiversionRequest,
  ): Promise<void> {
    if (await this.existsActiveDiversion(flightId)) {
      throw new ConflictException(
        'Active diversion already exists for this flight',
      );
    }

    const reporterRole: DiversionReporterRole =
      currentUser.role === UserRole.CabinCrew
        ? DiversionReporterRole.Crew
        : DiversionReporterRole.Operations;

    await this.prisma.diversion.create({
      data: {
        flightId,
        ...data,
        reportedBy: currentUser.sub,
        reporterRole,
        decisionTime: new Date(),
        position: data.position as unknown as Prisma.InputJsonValue,
      },
    });
  }

  public async existsActiveDiversion(flightId: string): Promise<boolean> {
    const count = await this.prisma.diversion.count({ where: { flightId } });

    return count > 0;
  }
}
