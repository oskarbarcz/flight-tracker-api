import { Prisma, UserTravelStatus, UserTravelType } from '../../client/client';

const ALAN = '725f5df2-0c78-4fe8-89a2-52566c89cf7f';
const RICK = 'fcf6f4bc-290d-43a9-843c-409cd47e143d';

const KJFK = '3c721cc6-c653-4fad-be43-dc9d6a149383';
const EDDF = 'f35c094a-bec5-4803-be32-bd80a14b441a';
const KBOS = 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3';
const KPHL = 'e764251b-bb25-4e8b-8cc7-11b0397b4554';

const LH42 = '006f0754-1ed7-4ae1-9f91-fae2d446a6e7';
const AAL4913 = '04be266c-df78-4bec-9f50-281cc02ce7f2';

export async function loadUserTravel(
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.userTravel.createMany({
    data: [
      {
        // pending leg Rick is performing on AAL4913 (KBOS -> KPHL);
        // flipped to finished when the flight reports on-block
        id: 'b92a34c1-3d77-4a6b-9d11-80c95ccc01db',
        userId: RICK,
        type: UserTravelType.performing_flight,
        status: UserTravelStatus.pending,
        departureAirportId: KBOS,
        destinationAirportId: KPHL,
        distance: 243,
        flightId: AAL4913,
        createdAt: new Date('2025-01-01 09:00'),
        updatedAt: null,
      },
      {
        id: '4f997097-32f2-4ed1-834a-0c71d7efc113',
        userId: ALAN,
        type: UserTravelType.dead_head_manual,
        status: UserTravelStatus.finished,
        departureAirportId: EDDF,
        destinationAirportId: KJFK,
        distance: 3342,
        flightId: null,
        createdAt: new Date('2025-01-02 10:00'),
        updatedAt: null,
      },
      {
        id: 'bd05cae0-dd40-4456-a4cd-9e5f0a95f868',
        userId: ALAN,
        type: UserTravelType.dead_head_automatic,
        status: UserTravelStatus.finished,
        departureAirportId: KJFK,
        destinationAirportId: KBOS,
        distance: 162,
        flightId: null,
        createdAt: new Date('2025-01-02 11:00'),
        updatedAt: null,
      },
      {
        id: '9df8f9c1-8ffa-43f6-a8e5-66f249f6b6cb',
        userId: ALAN,
        type: UserTravelType.performing_flight,
        status: UserTravelStatus.finished,
        departureAirportId: KBOS,
        destinationAirportId: KPHL,
        distance: 243,
        flightId: LH42,
        createdAt: new Date('2025-01-02 12:00'),
        updatedAt: new Date('2025-01-02 18:00'),
      },
      {
        id: '3d3a4355-fc36-492e-be46-6183559359d1',
        userId: ALAN,
        type: UserTravelType.performing_flight,
        status: UserTravelStatus.pending,
        departureAirportId: KJFK,
        destinationAirportId: EDDF,
        distance: 3342,
        flightId: LH42,
        createdAt: new Date('2025-01-03 09:00'),
        updatedAt: null,
      },
    ],
  });
}
