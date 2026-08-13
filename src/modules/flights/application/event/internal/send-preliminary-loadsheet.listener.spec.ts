import { SendPreliminaryLoadsheetListener } from './send-preliminary-loadsheet.listener';
import { GetFlightQuery } from '../../query/get-flight.query';
import { GetDiscordRecipientQuery } from '../../../../users/application/query/get-discord-recipient.query';
import { DiscordNotification } from '../../../../users/model/discord-settings.model';
import { ListFlightCrewQuery } from '../../../../crew/application/query/list-flight-crew.query';
import { BoardingWasStartedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';

const FLIGHT_ID = 'b3899775-278e-4496-add1-21385a13d93e';
const CAPTAIN_ID = '629be07f-5e65-429a-9d69-d34b99185f50';
const DISCORD_ID = '100000000000000100';
const FRONTEND_BASE_URL = 'https://flights.example.com';

const LOADSHEET = {
  flightCrew: { pilots: 2, reliefPilots: 1, cabinCrew: 4 },
  passengers: 200,
  cargo: 3.5,
  payload: 22.507,
  zeroFuelWeight: 189.507,
  blockFuel: 11.5,
};

function boardingStarted() {
  return new BoardingWasStartedEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.User,
    actorId: CAPTAIN_ID,
  });
}

describe('SendPreliminaryLoadsheetListener', () => {
  let client: { sendMessage: jest.Mock; sendDirectMessage: jest.Mock };
  let queryBus: { execute: jest.Mock };
  let flightsRepository: { getCaptainId: jest.Mock };
  let listener: SendPreliminaryLoadsheetListener;
  let recipient: string | null;
  let preliminary: typeof LOADSHEET | null;
  let crew: { name: string; role: string }[];

  beforeEach(() => {
    recipient = DISCORD_ID;
    preliminary = LOADSHEET;
    crew = [{ name: 'Anna Nowak', role: 'fa' }];

    client = { sendMessage: jest.fn(), sendDirectMessage: jest.fn() };
    flightsRepository = {
      getCaptainId: jest
        .fn()
        .mockImplementation(() => Promise.resolve(CAPTAIN_ID)),
    };
    queryBus = {
      execute: jest.fn().mockImplementation((query: unknown) => {
        if (query instanceof GetDiscordRecipientQuery) {
          expect(query.notification).toBe(
            DiscordNotification.PreliminaryLoadsheet,
          );

          return Promise.resolve(recipient);
        }

        if (query instanceof GetFlightQuery) {
          return Promise.resolve({
            id: FLIGHT_ID,
            flightNumber: 'LH81',
            loadsheets: { preliminary, final: null },
          });
        }

        if (query instanceof ListFlightCrewQuery) {
          return Promise.resolve(crew);
        }

        return Promise.reject(new Error('unexpected query'));
      }),
    };

    listener = new SendPreliminaryLoadsheetListener(
      client as never,
      queryBus as never,
      flightsRepository as never,
      { getOrThrow: () => FRONTEND_BASE_URL } as never,
    );
  });

  it('sends the preliminary loadsheet to the captain', async () => {
    await listener.onBoardingStarted(boardingStarted());

    expect(client.sendDirectMessage).toHaveBeenCalledTimes(1);
    const [memberId, message] = client.sendDirectMessage.mock.calls[0];
    expect(memberId).toBe(DISCORD_ID);
    expect(message.type).toBe('preliminary-loadsheet');
    expect(message.flightId).toBe(FLIGHT_ID);
    expect(message.content).toContain(
      ':clipboard: **Flight LH 81 preliminary loadsheet**',
    );
    expect(message.content).toContain('FA  Anna Nowak');
    expect(message.content).toContain('passengers:  200');
    expect(message.content).toContain(
      `[**Flight Tracker app**](${FRONTEND_BASE_URL}/flight/${FLIGHT_ID}).`,
    );
  });

  it('sends the loadsheet without a crew list when nobody is assigned', async () => {
    crew = [];

    await listener.onBoardingStarted(boardingStarted());

    const [, message] = client.sendDirectMessage.mock.calls[0];
    expect(message.content).not.toContain('Crew:');
    expect(message.content).toContain('Load:');
  });

  it('sends nothing when the flight has no preliminary loadsheet', async () => {
    preliminary = null;

    await listener.onBoardingStarted(boardingStarted());

    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('sends nothing when the captain disabled the message or has no account', async () => {
    recipient = null;

    await listener.onBoardingStarted(boardingStarted());

    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('sends nothing when the flight has no captain', async () => {
    flightsRepository.getCaptainId.mockResolvedValue(null);

    await listener.onBoardingStarted(boardingStarted());

    expect(queryBus.execute).not.toHaveBeenCalled();
    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('keeps a failing message from breaking the boarding start', async () => {
    client.sendDirectMessage.mockRejectedValue(new Error('discord is down'));

    await expect(
      listener.onBoardingStarted(boardingStarted()),
    ).resolves.toBeUndefined();
  });
});
