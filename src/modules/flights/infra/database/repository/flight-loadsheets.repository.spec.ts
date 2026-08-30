import { FlightLoadsheetsRepository } from './flight-loadsheets.repository';
import { Loadsheet } from '../../../model/loadsheet.model';
import { LoadsheetRevisionConflictError } from '../../../model/error/flight.error';
import { Prisma } from 'prisma/client/client';

const FLIGHT_ID = '7105891a-8008-4b47-b473-c81c97615ad7';
const ACTOR_ID = 'f0c1a2b3-4d5e-4f60-9a1b-2c3d4e5f6a7b';

function loadsheet(overrides: Partial<Loadsheet> = {}): Loadsheet {
  return {
    flightCrew: { pilots: 2, reliefPilots: 0, cabinCrew: 4 },
    passengers: 174,
    cargo: 1.9,
    payload: 19.3,
    zeroFuelWeight: 60.7,
    blockFuel: 11.9,
    ...overrides,
  } as Loadsheet;
}

function prismaWith(currentRevision: number | null) {
  return {
    flightLoadsheet: {
      findFirst: jest
        .fn()
        .mockResolvedValue(
          currentRevision === null ? null : { revision: currentRevision },
        ),
      create: jest.fn().mockResolvedValue({}),
    },
  };
}

describe('FlightLoadsheetsRepository', () => {
  it('issues the first preliminary loadsheet as revision 1', async () => {
    const prisma = prismaWith(null);
    const repository = new FlightLoadsheetsRepository(prisma as never);

    await repository.issuePreliminary(FLIGHT_ID, loadsheet(), ACTOR_ID);

    const { data } = prisma.flightLoadsheet.create.mock.calls[0][0];
    expect(data.revision).toBe(1);
    expect(data.kind).toBe('preliminary');
    expect(data.flightId).toBe(FLIGHT_ID);
    expect(data.issuedById).toBe(ACTOR_ID);
  });

  it('issues the next preliminary revision after the current one', async () => {
    const prisma = prismaWith(2);
    const repository = new FlightLoadsheetsRepository(prisma as never);

    await repository.issuePreliminary(FLIGHT_ID, loadsheet(), ACTOR_ID);

    const { data } = prisma.flightLoadsheet.create.mock.calls[0][0];
    expect(data.revision).toBe(3);
  });

  it('issues the final loadsheet as revision 1', async () => {
    const prisma = prismaWith(4);
    const repository = new FlightLoadsheetsRepository(prisma as never);

    await repository.issueFinal(FLIGHT_ID, loadsheet(), ACTOR_ID);

    const { data } = prisma.flightLoadsheet.create.mock.calls[0][0];
    expect(data.revision).toBe(1);
    expect(data.kind).toBe('final');
  });

  it('writes no fuel figures when the loadsheet carries no breakdown', async () => {
    const prisma = prismaWith(null);
    const repository = new FlightLoadsheetsRepository(prisma as never);

    await repository.issuePreliminary(FLIGHT_ID, loadsheet(), ACTOR_ID);

    const { data } = prisma.flightLoadsheet.create.mock.calls[0][0];
    expect(data.fuelBlock).toBeNull();
    expect(data.fuelTankering).toBeNull();
  });

  it('writes a count per cabin of the passenger breakdown', async () => {
    const prisma = prismaWith(null);
    const repository = new FlightLoadsheetsRepository(prisma as never);

    await repository.issuePreliminary(
      FLIGHT_ID,
      loadsheet({ passengersByCabin: { business: 24, economy: 150 } }),
      ACTOR_ID,
    );

    const { data } = prisma.flightLoadsheet.create.mock.calls[0][0];
    expect(data.businessPassengers).toBe(24);
    expect(data.economyPassengers).toBe(150);
    expect(data.firstPassengers).toBeNull();
    expect(data.premiumEconomyPassengers).toBeNull();
  });

  it('reports a revision claimed concurrently as a conflict', async () => {
    const prisma = prismaWith(1);
    prisma.flightLoadsheet.create = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: '7',
      }),
    );
    const repository = new FlightLoadsheetsRepository(prisma as never);

    await expect(
      repository.issuePreliminary(FLIGHT_ID, loadsheet(), ACTOR_ID),
    ).rejects.toThrow(LoadsheetRevisionConflictError);
  });

  it('lets an unrelated database failure through', async () => {
    const prisma = prismaWith(1);
    const failure = new Error('connection lost');
    prisma.flightLoadsheet.create = jest.fn().mockRejectedValue(failure);
    const repository = new FlightLoadsheetsRepository(prisma as never);

    await expect(
      repository.issuePreliminary(FLIGHT_ID, loadsheet(), ACTOR_ID),
    ).rejects.toThrow(failure);
  });
});
