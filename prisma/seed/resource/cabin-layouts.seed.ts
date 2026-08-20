import { CabinLayout, Prisma } from '../../client/client';

export async function loadCabinLayouts(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const catalogued = new Date('2026-08-01T09:00:00.000Z');
  const withdrawn = new Date('2026-08-12T09:00:00.000Z');

  const layouts: CabinLayout[] = [
    {
      id: 'aa-77w',
      airlineIata: 'AA',
      aircraftIata: '77W',
      variant: null,
      sourceSlugs: ['aa-77w'],
      firstSeenAt: catalogued,
      retiredAt: null,
    },
    {
      id: 'aa-77w-2',
      airlineIata: 'AA',
      aircraftIata: '77W',
      variant: '2',
      sourceSlugs: ['aa-77w-2'],
      firstSeenAt: catalogued,
      retiredAt: null,
    },
    {
      id: 'de-321',
      airlineIata: 'DE',
      aircraftIata: '321',
      variant: null,
      sourceSlugs: ['de-321'],
      firstSeenAt: catalogued,
      retiredAt: null,
    },
    {
      id: 'kl-738',
      airlineIata: 'KL',
      aircraftIata: '738',
      variant: null,
      sourceSlugs: ['kl-738'],
      firstSeenAt: catalogued,
      retiredAt: null,
    },
    {
      id: 'kl-77w',
      airlineIata: 'KL',
      aircraftIata: '77W',
      variant: null,
      sourceSlugs: ['kl-77w'],
      firstSeenAt: catalogued,
      retiredAt: null,
    },
    {
      id: 'lh-74h',
      airlineIata: 'LH',
      aircraftIata: '74H',
      variant: null,
      sourceSlugs: ['lh-74h-m', 'lh-74h-u'],
      firstSeenAt: catalogued,
      retiredAt: null,
    },
    {
      id: 'fi-752-1',
      airlineIata: 'FI',
      aircraftIata: '752',
      variant: '1',
      sourceSlugs: ['fi-752-1'],
      firstSeenAt: catalogued,
      retiredAt: withdrawn,
    },
  ];

  for (const layout of layouts) {
    await tx.cabinLayout.create({ data: layout });
  }
}
