import { Prisma } from '../../client/client';

export async function loadDeviceAuthorizations(
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.deviceAuthorization.createMany({
    data: [
      {
        id: '475131be-fca1-47c0-9517-5c6f1c2ddfa4',
        deviceCode:
          'f2467a0e4b844b53cdf91c097aad655637f0cea2e2dd376bc44118836288b412',
        userCode: 'SFCDNLVQ',
        client: 'transponder',
        deviceName: 'SIM-PC',
        status: 'pending',
        userId: null,
        createdAt: new Date('2026-11-01T10:00:00.000Z'),
        expiresAt: new Date('2036-01-01T00:00:00.000Z'),
      },
      {
        id: 'ec808f22-d153-4dbe-95f1-5234d02a8bf4',
        deviceCode:
          '4b3225d96a0b2c36006f68fb01056ac624b851b22422ed574422683adf3622c9',
        userCode: 'ZBHGBXCL',
        client: 'transponder',
        deviceName: 'HANGAR-PC',
        status: 'approved',
        userId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        createdAt: new Date('2026-11-01T10:05:00.000Z'),
        expiresAt: new Date('2036-01-01T00:00:00.000Z'),
      },
      {
        id: '0eaf298c-8b39-41ec-9a4f-8cae0c464085',
        deviceCode:
          'a839921a4e3f20afebec954fd325ee697b0a13e119034a59d9a1b18748c05863',
        userCode: 'NVMDPBFN',
        client: 'transponder',
        deviceName: null,
        status: 'denied',
        userId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        createdAt: new Date('2026-11-01T10:10:00.000Z'),
        expiresAt: new Date('2036-01-01T00:00:00.000Z'),
      },
      {
        id: 'ea068957-9606-4487-ab8e-a0a084e889e2',
        deviceCode:
          'ae83ce868e717d32f2fe051a98f27a3ca2ea20d99d9cd674586c02f30a2e3fc8',
        userCode: 'XZFMRQMB',
        client: 'transponder',
        deviceName: 'SIM-PC',
        status: 'pending',
        userId: null,
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        expiresAt: new Date('2025-01-01T10:10:00.000Z'),
      },
    ],
  });
}
