import { OperatorsRepository } from './operators.repository';
import {
  OperatorServiceType,
  OperatorType,
} from '../../../model/operator.model';
import { Continent } from '../../../../airports/model/airport.model';

const USER_ID = 'd3f6c1a4-9b52-4c7e-8f01-2a6de4b7c910';

const OPERATOR_IDS = {
  aal: '1f630d38-ad24-47cc-950b-3783e71bbd10',
  afr: '3a1354c5-d9fb-428b-9f87-0e887e491f0d',
  dlh: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d',
  ice: 'e4ba1445-b413-49a9-b0c5-c8bd3df14b42',
  klm: '7d724b05-8eb9-4e66-84cc-bb101369d1a0',
};

function operatorRow(id: string, icaoCode: string) {
  return {
    id,
    icaoCode,
    iataCode: 'XX',
    shortName: icaoCode,
    fullName: `${icaoCode} Airlines`,
    callsign: icaoCode,
    type: OperatorType.Legacy,
    serviceType: OperatorServiceType.Passenger,
    hubs: ['FRA'],
    fleetSize: 1,
    fleetTypes: ['A320'],
    avgFleetAge: 10,
    logoUrl: null,
    backgroundUrl: null,
    continent: Continent.Europe,
    alliance: null,
    group: null,
  };
}

function ranked(id: string, createdAt: string) {
  return { operatorId: id, _max: { createdAt: new Date(createdAt) } };
}

describe('OperatorsRepository.findRecentlyInvolvedWith', () => {
  let prisma: {
    flight: { groupBy: jest.Mock };
    operator: { findMany: jest.Mock };
  };
  let repository: OperatorsRepository;

  beforeEach(() => {
    prisma = {
      flight: { groupBy: jest.fn() },
      operator: { findMany: jest.fn() },
    };
    repository = new OperatorsRepository(prisma as never);
  });

  function respondWith(
    ranking: ReturnType<typeof ranked>[],
    rows: ReturnType<typeof operatorRow>[],
  ) {
    prisma.flight.groupBy.mockResolvedValue(ranking);
    prisma.operator.findMany.mockResolvedValue(rows);
  }

  async function icaoCodesFor(limit = 4) {
    const operators = await repository.findRecentlyInvolvedWith(USER_ID, limit);

    return operators.map((operator) => operator.icaoCode);
  }

  it('scopes the aggregation to flights the user captained or created', async () => {
    respondWith([], []);

    await repository.findRecentlyInvolvedWith(USER_ID, 4);

    expect(prisma.flight.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['operatorId'],
        where: { OR: [{ captainId: USER_ID }, { createdById: USER_ID }] },
        take: 4,
      }),
    );
  });

  it('narrows the aggregation to carriers of the requested traffic', async () => {
    respondWith([], []);

    await repository.findRecentlyInvolvedWith(
      USER_ID,
      4,
      OperatorServiceType.Cargo,
    );

    expect(prisma.flight.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ captainId: USER_ID }, { createdById: USER_ID }],
          operator: {
            serviceType: {
              in: [OperatorServiceType.Cargo, OperatorServiceType.Both],
            },
          },
        },
        take: 4,
      }),
    );
  });

  it('narrows before capping, so the cap counts only matching carriers', async () => {
    respondWith([], []);

    await repository.findRecentlyInvolvedWith(
      USER_ID,
      4,
      OperatorServiceType.Cargo,
    );

    const [call] = prisma.flight.groupBy.mock.calls as [
      [{ where: Record<string, unknown>; take: number }],
    ];

    expect(call[0].where).toHaveProperty('operator');
    expect(call[0].take).toBe(4);
  });

  it('leaves the aggregation unfiltered when no traffic kind is asked for', async () => {
    respondWith([], []);

    await repository.findRecentlyInvolvedWith(USER_ID, 4);

    const [call] = prisma.flight.groupBy.mock.calls as [
      [{ where: Record<string, unknown> }],
    ];

    expect(call[0].where).not.toHaveProperty('operator');
  });

  it('does not require a flight to have completed', async () => {
    respondWith([], []);

    await repository.findRecentlyInvolvedWith(USER_ID, 4);

    const [call] = prisma.flight.groupBy.mock.calls as [
      [{ where: Record<string, unknown> }],
    ];

    expect(call[0].where).not.toHaveProperty('completedAt');
  });

  it('returns a single carrier the user has been involved with', async () => {
    respondWith(
      [ranked(OPERATOR_IDS.dlh, '2025-02-03T10:45:00.000Z')],
      [operatorRow(OPERATOR_IDS.dlh, 'DLH')],
    );

    await expect(icaoCodesFor()).resolves.toEqual(['DLH']);
  });

  it('orders carriers newest first', async () => {
    respondWith(
      [
        ranked(OPERATOR_IDS.klm, '2025-02-05T14:20:00.000Z'),
        ranked(OPERATOR_IDS.ice, '2025-02-04T12:35:00.000Z'),
        ranked(OPERATOR_IDS.aal, '2025-02-01T18:05:00.000Z'),
      ],
      [
        operatorRow(OPERATOR_IDS.aal, 'AAL'),
        operatorRow(OPERATOR_IDS.ice, 'ICE'),
        operatorRow(OPERATOR_IDS.klm, 'KLM'),
      ],
    );

    await expect(icaoCodesFor()).resolves.toEqual(['KLM', 'ICE', 'AAL']);
  });

  it('reorders hydrated operators that arrive in a different order', async () => {
    respondWith(
      [
        ranked(OPERATOR_IDS.klm, '2025-02-05T14:20:00.000Z'),
        ranked(OPERATOR_IDS.dlh, '2025-02-03T10:45:00.000Z'),
      ],
      [
        operatorRow(OPERATOR_IDS.dlh, 'DLH'),
        operatorRow(OPERATOR_IDS.klm, 'KLM'),
      ],
    );

    await expect(icaoCodesFor()).resolves.toEqual(['KLM', 'DLH']);
  });

  it('breaks a tie on identical completion times by ICAO code', async () => {
    respondWith(
      [
        ranked(OPERATOR_IDS.dlh, '2025-02-03T10:45:00.000Z'),
        ranked(OPERATOR_IDS.afr, '2025-02-03T10:45:00.000Z'),
      ],
      [
        operatorRow(OPERATOR_IDS.dlh, 'DLH'),
        operatorRow(OPERATOR_IDS.afr, 'AFR'),
      ],
    );

    await expect(icaoCodesFor()).resolves.toEqual(['AFR', 'DLH']);
  });

  it('returns the carriers the aggregation selected when more were flown', async () => {
    respondWith(
      [
        ranked(OPERATOR_IDS.klm, '2025-02-05T14:20:00.000Z'),
        ranked(OPERATOR_IDS.ice, '2025-02-04T12:35:00.000Z'),
        ranked(OPERATOR_IDS.afr, '2025-02-03T10:45:00.000Z'),
        ranked(OPERATOR_IDS.dlh, '2025-02-03T10:45:00.000Z'),
      ],
      [
        operatorRow(OPERATOR_IDS.afr, 'AFR'),
        operatorRow(OPERATOR_IDS.dlh, 'DLH'),
        operatorRow(OPERATOR_IDS.ice, 'ICE'),
        operatorRow(OPERATOR_IDS.klm, 'KLM'),
      ],
    );

    await expect(icaoCodesFor()).resolves.toEqual(['KLM', 'ICE', 'AFR', 'DLH']);
  });

  it('returns nothing when the user has no flights at all', async () => {
    respondWith([], []);

    await expect(icaoCodesFor()).resolves.toEqual([]);
    expect(prisma.operator.findMany).not.toHaveBeenCalled();
  });

  it('returns full operator bodies shaped like the unfiltered list', async () => {
    respondWith(
      [ranked(OPERATOR_IDS.dlh, '2025-02-03T10:45:00.000Z')],
      [operatorRow(OPERATOR_IDS.dlh, 'DLH')],
    );

    const [operator] = await repository.findRecentlyInvolvedWith(USER_ID, 4);

    expect(operator).toEqual(operatorRow(OPERATOR_IDS.dlh, 'DLH'));
  });
});

describe('OperatorsRepository.findAll', () => {
  let prisma: { operator: { findMany: jest.Mock } };
  let repository: OperatorsRepository;

  beforeEach(() => {
    prisma = { operator: { findMany: jest.fn().mockResolvedValue([]) } };
    repository = new OperatorsRepository(prisma as never);
  });

  it('filters on the requested traffic, counting carriers of both', async () => {
    await repository.findAll(OperatorServiceType.Cargo);

    expect(prisma.operator.findMany).toHaveBeenCalledWith({
      where: {
        serviceType: {
          in: [OperatorServiceType.Cargo, OperatorServiceType.Both],
        },
      },
    });
  });

  it('narrows to carriers of both when both is asked for', async () => {
    await repository.findAll(OperatorServiceType.Both);

    expect(prisma.operator.findMany).toHaveBeenCalledWith({
      where: { serviceType: { in: [OperatorServiceType.Both] } },
    });
  });

  it('applies no filter when no traffic kind is asked for', async () => {
    await repository.findAll();

    expect(prisma.operator.findMany).toHaveBeenCalledWith({
      where: undefined,
    });
  });
});
