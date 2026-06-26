import { DelayReportStatus, DelayReasonCode } from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

const prisma = new PrismaService();

const RICK = 'fcf6f4bc-290d-43a9-843c-409cd47e143d';
const ALICE = '721ab705-8608-4386-86b4-2f391a3655a7';

export async function loadDelay(): Promise<void> {
  await prisma.delayRequest.create({
    data: {
      id: '06505a5b-2475-470e-8825-c4a079e4be4b',
      flightId: '7105891a-8008-4b47-b473-c81c97615ad7',
      totalDelayMinutes: 10,
      createdAt: new Date('2025-01-01 13:15'),
      reports: {
        create: [
          {
            id: 'aa81d28e-c67f-4ba3-9637-77301ea408a1',
            delayMinutes: 6,
            reasonCode: DelayReasonCode.RLL,
            status: DelayReportStatus.pending,
            reportedById: RICK,
            createdAt: new Date('2025-01-01 13:16'),
          },
          {
            id: '368789fd-0a5c-4e96-9ed2-9c5b2de368d1',
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
      id: '9d54d8d3-ae4f-4fa4-b4c3-91d12891c81f',
      flightId: '38644393-deee-434d-bfd1-7242abdbc4e1',
      totalDelayMinutes: 10,
      createdAt: new Date('2025-01-01 13:15'),
      reports: {
        create: [
          {
            id: '4ccb028e-51f5-4d80-9c83-1ab1b3b13c30',
            delayMinutes: 6,
            reasonCode: DelayReasonCode.RLL,
            status: DelayReportStatus.accepted,
            reportedById: RICK,
            decidedById: ALICE,
            decidedAt: new Date('2025-01-01 13:20'),
            createdAt: new Date('2025-01-01 13:16'),
          },
          {
            id: '800243c5-0c77-4ace-b4cb-5b2ff499a1c1',
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
