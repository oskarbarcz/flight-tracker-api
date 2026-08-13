import { SendDelayApprovalListener } from './send-delay-approval.listener';
import { GetFlightQuery } from '../../query/get-flight.query';
import { GetDiscordRecipientQuery } from '../../../../users/application/query/get-discord-recipient.query';
import { DiscordNotification } from '../../../../users/model/discord-settings.model';
import { DelayReportWasAcceptedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';

const FLIGHT_ID = 'b3899775-278e-4496-add1-21385a13d93e';
const CAPTAIN_ID = '629be07f-5e65-429a-9d69-d34b99185f50';
const OPERATIONS_ID = '721ab705-8608-4386-86b4-2f391a3655a7';
const DISCORD_ID = '100000000000000100';
const FRONTEND_BASE_URL = 'https://flights.example.com';

function reportAccepted() {
  return new DelayReportWasAcceptedEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.Operations,
    actorId: OPERATIONS_ID,
  });
}

describe('SendDelayApprovalListener', () => {
  let client: { sendMessage: jest.Mock; sendDirectMessage: jest.Mock };
  let queryBus: { execute: jest.Mock };
  let flightsRepository: { getCaptainId: jest.Mock };
  let listener: SendDelayApprovalListener;
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
          expect(query.notification).toBe(DiscordNotification.DelayUpdates);

          return Promise.resolve(recipient);
        }

        if (query instanceof GetFlightQuery) {
          return Promise.resolve({ id: FLIGHT_ID, flightNumber: 'LH81' });
        }

        return Promise.reject(new Error('unexpected query'));
      }),
    };

    listener = new SendDelayApprovalListener(
      client as never,
      queryBus as never,
      flightsRepository as never,
      { getOrThrow: () => FRONTEND_BASE_URL } as never,
    );
  });

  it('tells the captain the allocation was approved', async () => {
    await listener.onDelayReportAccepted(reportAccepted());

    expect(client.sendDirectMessage).toHaveBeenCalledTimes(1);
    const [memberId, message] = client.sendDirectMessage.mock.calls[0];
    expect(memberId).toBe(DISCORD_ID);
    expect(message.type).toBe('delay-approval');
    expect(message.content).toContain(
      ':white_check_mark: **Flight LH 81 delay approved**',
    );
  });

  it('addresses the captain, not the operations user who approved', async () => {
    await listener.onDelayReportAccepted(reportAccepted());

    const [recipientQuery] = queryBus.execute.mock.calls[0];
    expect(recipientQuery.userId).toBe(CAPTAIN_ID);
    expect(recipientQuery.userId).not.toBe(OPERATIONS_ID);
  });

  it('sends nothing when the captain disabled the message or has no account', async () => {
    recipient = null;

    await listener.onDelayReportAccepted(reportAccepted());

    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('sends nothing when the flight has no captain', async () => {
    flightsRepository.getCaptainId.mockResolvedValue(null);

    await listener.onDelayReportAccepted(reportAccepted());

    expect(queryBus.execute).not.toHaveBeenCalled();
    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('keeps a failing message from breaking the approval', async () => {
    client.sendDirectMessage.mockRejectedValue(new Error('discord is down'));

    await expect(
      listener.onDelayReportAccepted(reportAccepted()),
    ).resolves.toBeUndefined();
  });
});
