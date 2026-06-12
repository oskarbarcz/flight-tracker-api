import { DelayReportStatus, DelayReasonCode } from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

const prisma = new PrismaService();

const RICK = 'fcf6f4bc-290d-43a9-843c-409cd47e143d';
const ALICE = '721ab705-8608-4386-86b4-2f391a3655a7';

export async function loadDelay(): Promise<void> {
  await prisma.delayRequest.create({
    data: {
      id: 'de1a0000-0000-4000-8000-000000000001',
      flightId: '7105891a-8008-4b47-b473-c81c97615ad7',
      totalDelayMinutes: 10,
      createdAt: new Date('2025-01-01 13:15'),
      reports: {
        create: [
          {
            id: 'de1a0000-0000-4000-8000-000000000011',
            delayMinutes: 6,
            reasonCode: DelayReasonCode.RLL,
            status: DelayReportStatus.pending,
            reportedById: RICK,
            createdAt: new Date('2025-01-01 13:16'),
          },
          {
            id: 'de1a0000-0000-4000-8000-000000000012',
            delayMinutes: 4,
            reasonCode: DelayReasonCode.ATZ,
            status: DelayReportStatus.pending,
            reportedById: RICK,
            createdAt: new Date('2025-01-01 13:17'),
          },
        ],
      },
    },
  });

  await prisma.delayRequest.create({
    data: {
      id: 'de1a0000-0000-4000-8000-000000000002',
      flightId: '38644393-deee-434d-bfd1-7242abdbc4e1',
      totalDelayMinutes: 10,
      createdAt: new Date('2025-01-01 13:15'),
      reports: {
        create: [
          {
            id: 'de1a0000-0000-4000-8000-000000000021',
            delayMinutes: 6,
            reasonCode: DelayReasonCode.RLL,
            status: DelayReportStatus.accepted,
            reportedById: RICK,
            decidedById: ALICE,
            decidedAt: new Date('2025-01-01 13:20'),
            createdAt: new Date('2025-01-01 13:16'),
          },
          {
            id: 'de1a0000-0000-4000-8000-000000000022',
            delayMinutes: 4,
            reasonCode: DelayReasonCode.ATZ,
            status: DelayReportStatus.accepted,
            reportedById: RICK,
            decidedById: ALICE,
            decidedAt: new Date('2025-01-01 13:21'),
            createdAt: new Date('2025-01-01 13:17'),
          },
        ],
      },
    },
  });
}
