import { PassengersBoardingNotificationListener } from './passengers-boarding-notification.listener';
import { GetFlightQuery } from '../../query/get-flight.query';
import { AirportType } from '../../../../airports/model/airport.model';
import { BoardingWasStartedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';

const FLIGHT_ID = 'b3899775-278e-4496-add1-21385a13d93e';
const PILOT_ID = '629be07f-5e65-429a-9d69-d34b99185f50';
const FRONTEND_BASE_URL = 'https://flights.example.com';

function flight() {
  return {
    id: FLIGHT_ID,
    flightNumber: 'LH81',
    airports: [
      {
        id: '0f0d1f8f-2b3e-4a3a-9d70-8ac1d2e5f6a1',
        type: AirportType.Departure,
        city: 'Frankfurt',
        iataCode: 'FRA',
      },
      {
        id: 'd3fbb1cb-0f26-4a41-9e5f-2ab6a2d80a2d',
        type: AirportType.Destination,
        city: 'New York',
        iataCode: 'JFK',
      },
    ],
    timesheet: {
      estimated: {
        offBlockTime: new Date('2025-01-05T09:00:00.000Z'),
        onBlockTime: new Date('2025-01-05T17:25:00.000Z'),
      },
    },
    loadsheets: { preliminary: { passengers: 293 } },
  };
}

function boardingStarted() {
  return new BoardingWasStartedEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.User,
    actorId: PILOT_ID,
  });
}

describe('PassengersBoardingNotificationListener', () => {
  let client: { sendMessage: jest.Mock; sendDirectMessage: jest.Mock };
  let queryBus: { execute: jest.Mock };
  let listener: PassengersBoardingNotificationListener;

  beforeEach(() => {
    client = { sendMessage: jest.fn(), sendDirectMessage: jest.fn() };
    queryBus = {
      execute: jest.fn().mockImplementation((query: unknown) => {
        if (query instanceof GetFlightQuery) {
          return Promise.resolve(flight());
        }

        return Promise.reject(new Error('unexpected query'));
      }),
    };

    listener = new PassengersBoardingNotificationListener(
      client as never,
      queryBus as never,
      { getOrThrow: () => FRONTEND_BASE_URL } as never,
    );
  });

  it('announces boarding in the public channel', async () => {
    await listener.onBoardingStarted(boardingStarted());

    expect(client.sendMessage).toHaveBeenCalledTimes(1);
    const [message] = client.sendMessage.mock.calls[0];
    expect(message.type).toBe('departure');
    expect(message.flightId).toBe(FLIGHT_ID);
    expect(message.content).toContain(
      'Flight **LH 81** from **Frankfurt (FRA)** to **New York (JFK)** has started boarding!',
    );
    expect(message.content).toContain(
      'Estimated block time: **08:25hrs**, Passengers on board: **293**',
    );
    expect(message.content).toContain(
      `[MyPreflight](${FRONTEND_BASE_URL}/map/${FLIGHT_ID})!`,
    );
  });

  it('never sends a direct message', async () => {
    await listener.onBoardingStarted(boardingStarted());

    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('keeps a failing announcement from breaking the boarding start', async () => {
    client.sendMessage.mockRejectedValue(new Error('discord is down'));

    await expect(
      listener.onBoardingStarted(boardingStarted()),
    ).resolves.toBeUndefined();
  });
});
