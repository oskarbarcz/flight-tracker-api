import { FlightArrivalNotificationListener } from './flight-arrival-notification.listener';
import { GetFlightQuery } from '../../query/get-flight.query';
import { AirportType } from '../../../../airports/model/airport.model';
import { OnBlockWasReportedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';

const FLIGHT_ID = '04be266c-df78-4bec-9f50-281cc02ce7f2';
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
      actual: {
        offBlockTime: new Date('2025-01-05T09:05:00.000Z'),
        onBlockTime: new Date('2025-01-05T17:30:00.000Z'),
      },
    },
  };
}

function onBlockReported() {
  return new OnBlockWasReportedEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.User,
    actorId: PILOT_ID,
    aircraftId: '785bdfda-291a-4c11-a5d9-b57b5c0b8e5e',
    landingAirportId: 'd3fbb1cb-0f26-4a41-9e5f-2ab6a2d80a2d',
    airportIds: [
      '0f0d1f8f-2b3e-4a3a-9d70-8ac1d2e5f6a1',
      'd3fbb1cb-0f26-4a41-9e5f-2ab6a2d80a2d',
    ],
  });
}

describe('FlightArrivalNotificationListener', () => {
  let client: { sendMessage: jest.Mock; sendDirectMessage: jest.Mock };
  let queryBus: { execute: jest.Mock };
  let listener: FlightArrivalNotificationListener;

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

    listener = new FlightArrivalNotificationListener(
      client as never,
      queryBus as never,
      { getOrThrow: () => FRONTEND_BASE_URL } as never,
    );
  });

  it('announces the arrival in the public channel', async () => {
    await listener.onOnBlockReported(onBlockReported());

    expect(client.sendMessage).toHaveBeenCalledTimes(1);
    const [message] = client.sendMessage.mock.calls[0];
    expect(message.type).toBe('arrival');
    expect(message.flightId).toBe(FLIGHT_ID);
    expect(message.content).toContain(
      'Flight **LH 81** from **Frankfurt (FRA)** to **New York (JFK)** just arrived!',
    );
    expect(message.content).toContain('Actual block time: **08:25hrs**');
    expect(message.content).toContain(
      `[Flight Tracker](${FRONTEND_BASE_URL}/map/${FLIGHT_ID})!`,
    );
  });

  it('reports the actual block time, not the estimate', async () => {
    await listener.onOnBlockReported(onBlockReported());

    const [message] = client.sendMessage.mock.calls[0];
    expect(message.content).not.toContain('Estimated block time');
  });

  it('keeps a failing announcement from breaking the on-block report', async () => {
    client.sendMessage.mockRejectedValue(new Error('discord is down'));

    await expect(
      listener.onOnBlockReported(onBlockReported()),
    ).resolves.toBeUndefined();
  });
});
