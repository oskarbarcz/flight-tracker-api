import { Prisma } from '../../client/client';

const LUFTHANSA = '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d';
const AMERICAN = '1f630d38-ad24-47cc-950b-3783e71bbd10';

const ALICE = '721ab705-8608-4386-86b4-2f391a3655a7';
const ALAN = '725f5df2-0c78-4fe8-89a2-52566c89cf7f';
const RICK = 'fcf6f4bc-290d-43a9-843c-409cd47e143d';

const EDDF = 'f35c094a-bec5-4803-be32-bd80a14b441a';
const KJFK = '3c721cc6-c653-4fad-be43-dc9d6a149383';
const KBOS = 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3';
const KPHL = 'e764251b-bb25-4e8b-8cc7-11b0397b4554';

const DLH450 = '3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05';
const AAL4908 = 'b3899775-278e-4496-add1-21385a13d93e';
const AAL4905 = '23da8bc9-a21b-4678-b2e9-1151d3bd15ab';
const AAL4917 = 'd085c107-308d-48e6-9c93-beca6552a8a3';

const CREATED_AT = new Date('2025-01-01T00:00:00.000Z');

export async function loadRotations(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const rotations = [
    {
      id: '3e12423f-3add-4c0a-b594-07e0b32413e0',
      name: 'FRA-JFK-FRA 2025-01-01',
      operatorId: LUFTHANSA,
      pilotId: ALAN,
      createdById: ALICE,
      status: 'draft',
      createdAt: CREATED_AT,
      updatedAt: null,
      legs: [
        {
          id: '34d72055-0f5c-4bd3-8e02-4db80131de48',
          flightNumber: 'LH450',
          departureId: EDDF,
          arrivalId: KJFK,
          offBlockTime: new Date('2025-01-01T12:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T20:00:00.000Z'),
          flightId: null,
        },
        {
          id: '916e6138-b189-4bb5-b23f-3f649e203bea',
          flightNumber: 'LH41',
          departureId: KJFK,
          arrivalId: EDDF,
          offBlockTime: new Date('2025-01-01T22:00:00.000Z'),
          onBlockTime: new Date('2025-01-02T06:00:00.000Z'),
          flightId: null,
        },
      ],
    },
    {
      id: '97f99ca3-6e34-4d99-8631-de754bad0b37',
      name: 'FRA-JFK-FRA 2025-01-02',
      operatorId: LUFTHANSA,
      pilotId: ALAN,
      createdById: ALICE,
      status: 'ready',
      createdAt: CREATED_AT,
      updatedAt: null,
      legs: [
        {
          id: 'd31970a7-9dda-4aee-8174-81da36756fd1',
          flightNumber: 'LH888',
          departureId: EDDF,
          arrivalId: KJFK,
          offBlockTime: new Date('2025-01-01T12:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T20:00:00.000Z'),
          flightId: null,
        },
        {
          id: 'b85748ad-710e-49a7-9102-a9b93cd4a989',
          flightNumber: 'LH41',
          departureId: KJFK,
          arrivalId: EDDF,
          offBlockTime: new Date('2025-01-01T22:00:00.000Z'),
          onBlockTime: new Date('2025-01-02T06:00:00.000Z'),
          flightId: null,
        },
      ],
    },
    {
      id: 'de76f066-23a6-4a49-aa5e-e9d524f4efb8',
      name: 'FRA-JFK-FRA 2025-01-03',
      operatorId: LUFTHANSA,
      pilotId: ALAN,
      createdById: ALICE,
      status: 'ready',
      createdAt: CREATED_AT,
      updatedAt: null,
      legs: [
        {
          id: '9c347301-fa9e-4c26-aa29-0295415053c8',
          flightNumber: 'LH450',
          departureId: EDDF,
          arrivalId: KJFK,
          offBlockTime: new Date('2025-01-01T12:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T20:00:00.000Z'),
          flightId: DLH450,
        },
        {
          id: '7037a573-2971-4fb6-8c34-8a98c9bc71c8',
          flightNumber: 'LH41',
          departureId: KJFK,
          arrivalId: EDDF,
          offBlockTime: new Date('2025-01-01T22:00:00.000Z'),
          onBlockTime: new Date('2025-01-02T06:00:00.000Z'),
          flightId: null,
        },
      ],
    },
    {
      id: 'a951b190-f022-415a-b02d-137905db140d',
      name: 'Single leg FRA-JFK',
      operatorId: LUFTHANSA,
      pilotId: ALAN,
      createdById: ALICE,
      status: 'draft',
      createdAt: CREATED_AT,
      updatedAt: null,
      legs: [
        {
          id: '879372a9-2946-4b90-b191-d8766fb926c5',
          flightNumber: 'LH450',
          departureId: EDDF,
          arrivalId: KJFK,
          offBlockTime: new Date('2025-01-01T12:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T20:00:00.000Z'),
          flightId: null,
        },
      ],
    },
    {
      id: '8459dc04-4cf9-46ba-a16f-226e677940b8',
      name: 'Broken chain sample',
      operatorId: LUFTHANSA,
      pilotId: ALAN,
      createdById: ALICE,
      status: 'draft',
      createdAt: CREATED_AT,
      updatedAt: null,
      legs: [
        {
          id: '46cdd9e4-7699-4fe5-a13e-44e3a1361a95',
          flightNumber: 'LH450',
          departureId: EDDF,
          arrivalId: KJFK,
          offBlockTime: new Date('2025-01-01T12:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T20:00:00.000Z'),
          flightId: null,
        },
        {
          id: '2c86b79a-2bf9-4e72-9754-05535b0670b7',
          flightNumber: 'AA100',
          departureId: KBOS,
          arrivalId: KPHL,
          offBlockTime: new Date('2025-01-01T22:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T23:30:00.000Z'),
          flightId: null,
        },
      ],
    },
    {
      id: 'd182d0f0-5b7d-4092-b6d9-0c3c11775a85',
      name: 'BOS-PHL-BOS 2025-01-01',
      operatorId: AMERICAN,
      pilotId: RICK,
      createdById: ALICE,
      status: 'in_progress',
      createdAt: CREATED_AT,
      updatedAt: null,
      legs: [
        {
          id: '69de1c35-96e1-4c0e-9b4c-c5777081f6e9',
          flightNumber: 'AA4908',
          departureId: KBOS,
          arrivalId: KPHL,
          offBlockTime: new Date('2025-01-01T13:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T14:30:00.000Z'),
          flightId: AAL4908,
        },
        {
          id: '4a406198-f4a9-4859-bd30-b2b431f1b9ed',
          flightNumber: 'AA4910',
          departureId: KPHL,
          arrivalId: KBOS,
          offBlockTime: new Date('2025-01-01T16:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T17:30:00.000Z'),
          flightId: null,
        },
      ],
    },
    {
      id: '7f5f13b1-5f14-4418-af23-8128ff4f6410',
      name: 'BOS-PHL-BOS 2024-12-31',
      operatorId: AMERICAN,
      pilotId: RICK,
      createdById: ALICE,
      status: 'finished',
      createdAt: new Date('2025-01-02T00:00:00.000Z'),
      updatedAt: null,
      legs: [
        {
          id: '2fff235c-17c3-4286-9682-2877fcf13eb5',
          flightNumber: 'AA4905',
          departureId: KBOS,
          arrivalId: KPHL,
          offBlockTime: new Date('2025-01-01T08:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T09:30:00.000Z'),
          flightId: AAL4905,
        },
        {
          id: '7d55710c-a39b-48bd-9ab0-ef8c6034f613',
          flightNumber: 'AA4917',
          departureId: KPHL,
          arrivalId: KBOS,
          offBlockTime: new Date('2025-01-01T11:00:00.000Z'),
          onBlockTime: new Date('2025-01-01T12:30:00.000Z'),
          flightId: AAL4917,
        },
      ],
    },
  ];

  for (const { legs, ...rotation } of rotations) {
    await tx.rotation.create({
      data: { ...rotation, legs: { create: legs } },
    });
  }
}
