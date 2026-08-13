import { SendDelayAllocationRequestListener } from './send-delay-allocation-request.listener';
import { GetFlightQuery } from '../../query/get-flight.query';
import { GetDelayRequestQuery } from '../../query/delay/get-delay-request.query';
import { GetDiscordRecipientQuery } from '../../../../users/application/query/get-discord-recipient.query';
import { DiscordNotification } from '../../../../users/model/discord-settings.model';
import { DelayRequestWasCreatedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';

const FLIGHT_ID = 'b3899775-278e-4496-add1-21385a13d93e';
const CAPTAIN_ID = '629be07f-5e65-429a-9d69-d34b99185f50';
const DISCORD_ID = '100000000000000100';
const FRONTEND_BASE_URL = 'https://flights.example.com';

function delayRaised() {
  return new DelayRequestWasCreatedEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.Operations,
    actorId: null,
  });
}

describe('SendDelayAllocationRequestListener', () => {
  let client: { sendMessage: jest.Mock; sendDirectMessage: jest.Mock };
  let queryBus: { execute: jest.Mock };
  let flightsRepository: { getCaptainId: jest.Mock };
  let listener: SendDelayAllocationRequestListener;
  let recipient: string | null;

  beforeEach(() => {
    recipient = DISCORD_ID;

    client = { sendMessage: jest.fn(), sendDirectMessage: jest.fn() };
    flightsRepository = {
      getCaptainId: jest.fn().mockResolvedValue(CAPTAIN_ID),
    };
    queryBus = {
      execute: jest.fn().mockImplementation((query: unknown) => {
        if (query instanceof GetDiscordRecipientQuery) {
          expect(query.notification).toBe(DiscordNotification.DelayAllocation);

          return Promise.resolve(recipient);
        }

        if (query instanceof GetFlightQuery) {
          return Promise.resolve({ id: FLIGHT_ID, flightNumber: 'LH81' });
        }

        if (query instanceof GetDelayRequestQuery) {
          return Promise.resolve({ totalDelayMinutes: 12 });
        }

        return Promise.reject(new Error('unexpected query'));
      }),
    };

    listener = new SendDelayAllocationRequestListener(
      client as never,
      queryBus as never,
      flightsRepository as never,
      { getOrThrow: () => FRONTEND_BASE_URL } as never,
    );
  });

  it('asks the captain to allocate the delay', async () => {
    await listener.onDelayRequestCreated(delayRaised());

    expect(client.sendDirectMessage).toHaveBeenCalledTimes(1);
    const [memberId, message] = client.sendDirectMessage.mock.calls[0];
    expect(memberId).toBe(DISCORD_ID);
    expect(message.type).toBe('delay-allocation');
    expect(message.content).toContain(':hourglass: **Flight LH 81 delay**');
    expect(message.content).toContain('**12 minutes**');
  });

  it('links to the allocation screen for the flight', async () => {
    await listener.onDelayRequestCreated(delayRaised());

    const [, message] = client.sendDirectMessage.mock.calls[0];
    expect(message.content).toContain(
      `[**Flight Tracker app**](${FRONTEND_BASE_URL}/flight/${FLIGHT_ID}/delay).`,
    );
  });

  it('sends nothing when the captain disabled the message or has no account', async () => {
    recipient = null;

    await listener.onDelayRequestCreated(delayRaised());

    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('sends nothing when the flight has no captain', async () => {
    flightsRepository.getCaptainId.mockResolvedValue(null);

    await listener.onDelayRequestCreated(delayRaised());

    expect(queryBus.execute).not.toHaveBeenCalled();
    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('keeps a failing message from breaking the delay creation', async () => {
    client.sendDirectMessage.mockRejectedValue(new Error('discord is down'));

    await expect(
      listener.onDelayRequestCreated(delayRaised()),
    ).resolves.toBeUndefined();
  });
});
