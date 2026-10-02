import {
  ChangeRequestResource,
  ChangeRequestStatus,
  Prisma,
} from '../../client/client';
import { AIRPORT_IDS } from './airports.seed';
import { CITY_IDS } from './cities.seed';
import { USER_IDS } from './users.seed';

export async function loadChangeRequests(
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.changeRequest.createMany({
    data: [
      {
        id: '61c109eb-1d4c-41b5-b25c-a2be96984793',
        resource: ChangeRequestResource.airport,
        targetId: AIRPORT_IDS.frankfurt,
        payload: { timezone: 'Europe/Berlin' },
        status: ChangeRequestStatus.accepted,
        requestedById: USER_IDS.rick,
        decidedById: USER_IDS.alice,
        appliedSnapshot: { timezone: 'Europe/Paris' },
        decidedAt: new Date('2026-08-16T10:00:00.000Z'),
        createdAt: new Date('2026-08-15T10:00:00.000Z'),
      },
      {
        id: '11fd5e75-3857-424e-ab48-310a29f0d7ce',
        resource: ChangeRequestResource.airport,
        targetId: AIRPORT_IDS.boston,
        payload: { continent: 'europe' },
        status: ChangeRequestStatus.rejected,
        requestedById: USER_IDS.alan,
        decidedById: USER_IDS.john,
        rejectionReason: 'Boston is in North America.',
        decidedAt: new Date('2026-08-21T10:00:00.000Z'),
        createdAt: new Date('2026-08-20T10:00:00.000Z'),
      },
      {
        id: '683772a9-4b12-40d5-b7f4-33854fd93d3a',
        resource: ChangeRequestResource.airport,
        targetId: AIRPORT_IDS.gander,
        payload: { name: 'Gander International' },
        status: ChangeRequestStatus.withdrawn,
        requestedById: USER_IDS.rick,
        decidedAt: new Date('2026-08-26T10:00:00.000Z'),
        createdAt: new Date('2026-08-25T10:00:00.000Z'),
      },
      {
        id: 'acd93eae-b731-4794-9060-b7652bbc9905',
        resource: ChangeRequestResource.airport,
        targetId: AIRPORT_IDS.warsaw,
        payload: {
          name: 'Warsaw Chopin Airport',
          location: { latitude: 52.1657, longitude: 20.9671 },
        },
        status: ChangeRequestStatus.pending,
        requestedById: USER_IDS.rick,
        createdAt: new Date('2026-09-01T10:00:00.000Z'),
      },
      {
        id: '6fb17bfe-1836-4aaa-b68c-ce72f5440871',
        resource: ChangeRequestResource.airport,
        targetId: AIRPORT_IDS.warsaw,
        payload: { name: 'Lotnisko Chopina' },
        status: ChangeRequestStatus.pending,
        requestedById: USER_IDS.alan,
        createdAt: new Date('2026-09-02T09:00:00.000Z'),
      },
      {
        id: '18b07434-9994-451c-aa41-bb45b8386c65',
        resource: ChangeRequestResource.airport,
        targetId: AIRPORT_IDS.knock,
        payload: {
          name: 'Ireland West Airport Knock',
          cityId: CITY_IDS.shannon,
        },
        status: ChangeRequestStatus.pending,
        requestedById: USER_IDS.alan,
        createdAt: new Date('2026-09-02T12:00:00.000Z'),
      },
      {
        id: 'c751e610-c091-4b05-ae1e-9b1ad86d6f61',
        resource: ChangeRequestResource.airport,
        targetId: AIRPORT_IDS.orly,
        payload: {
          shape: [
            { latitude: 48.7389, longitude: 2.3355 },
            { latitude: 48.7389, longitude: 2.4012 },
            { latitude: 48.7101, longitude: 2.4012 },
            { latitude: 48.7101, longitude: 2.3355 },
          ],
        },
        status: ChangeRequestStatus.pending,
        requestedById: USER_IDS.rick,
        createdAt: new Date('2026-09-03T08:00:00.000Z'),
      },
    ],
  });
}
