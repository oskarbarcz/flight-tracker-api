import { v4 } from 'uuid';
import { Prisma } from '../../client/client';

export async function loadPostcardAwards(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const visits = await tx.userCityVisit.findMany({
    select: { userId: true, cityId: true, visitedAt: true },
    orderBy: { visitedAt: 'asc' },
  });

  const postcards = await tx.postcard.findMany({
    select: { id: true, cityId: true },
  });
  const postcardByCity = new Map(postcards.map((row) => [row.cityId, row.id]));

  const firstVisits = new Map<
    string,
    { postcardId: string; awardedAt: Date }
  >();

  for (const visit of visits) {
    const postcardId = postcardByCity.get(visit.cityId);
    const key = `${visit.userId}:${visit.cityId}`;

    if (!postcardId || firstVisits.has(key)) {
      continue;
    }

    firstVisits.set(key, { postcardId, awardedAt: visit.visitedAt });
  }

  const data = [...firstVisits.entries()].map(([key, award]) => ({
    id: v4(),
    userId: key.split(':')[0],
    postcardId: award.postcardId,
    awardedAt: award.awardedAt,
  }));

  if (data.length) {
    await tx.userPostcard.createMany({ data });
  }
}
