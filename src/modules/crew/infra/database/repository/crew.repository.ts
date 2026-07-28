import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { Crew, CrewRole } from '../../../model/crew.model';

@Injectable()
export class CrewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: {
    operatorId: string;
    role: CrewRole;
    name: string;
    email: string;
  }): Promise<string> {
    const crew = await this.prisma.crew.upsert({
      where: {
        operatorId_role_name: {
          operatorId: data.operatorId,
          role: data.role,
          name: data.name,
        },
      },
      create: data,
      update: {},
    });

    return crew.id;
  }

  async findById(crewId: string): Promise<Crew | null> {
    return this.prisma.crew.findUnique({ where: { id: crewId } });
  }

  async findByOperator(operatorId: string): Promise<Crew[]> {
    return this.prisma.crew.findMany({
      where: { operatorId },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  async findByFlight(flightId: string): Promise<Crew[]> {
    return this.prisma.crew.findMany({
      where: { flights: { some: { flightId } } },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  async linkToFlight(flightId: string, crewIds: string[]): Promise<void> {
    await this.prisma.crewOnFlights.createMany({
      data: crewIds.map((crewId) => ({ crewId, flightId })),
      skipDuplicates: true,
    });
  }

  async unlinkFromFlight(flightId: string, crewId: string): Promise<void> {
    await this.prisma.crewOnFlights.deleteMany({ where: { flightId, crewId } });
  }
}
