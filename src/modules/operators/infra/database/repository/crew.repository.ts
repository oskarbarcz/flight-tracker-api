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
  }): Promise<void> {
    await this.prisma.crew.upsert({
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
  }

  async findByOperator(operatorId: string): Promise<Crew[]> {
    return this.prisma.crew.findMany({
      where: { operatorId },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }
}
