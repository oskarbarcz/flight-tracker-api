import { DiscordService } from './discord.service';
import { GetFlightQuery } from '../../application/query/get-flight.query';
import { GetOfpQuery } from '../../application/query/get-ofp.query';
import { GetUserDiscordIdQuery } from '../../../users/application/query/get-user-discord-id.query';
import { FlightOfpNotFoundError } from '../../model/error/flight.error';
import { AirportType } from '../../../airports/model/airport.model';
import {
  BoardingWasStartedEvent,
  PilotCheckedInEvent,
} from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';

const FLIGHT_ID = 'b3899775-278e-4496-add1-21385a13d93e';
const PILOT_ID = '629be07f-5e65-429a-9d69-d34b99185f50';
const DISCORD_ID = '100000000000000100';
const OFP_URL = 'https://www.simbrief.com/ofp/flightplans/EDDFKJFK_PDF.pdf';

function flight() {
  return {
    id: FLIGHT_ID,
    flightNumber: 'LH81',
    aircraft: {
      registration: 'D-AIMK',
      airframe: { name: 'Airbus A330-900' },
    },
    airports: [
      {
        type: AirportType.Departure,
        city: 'Frankfurt',
        iataCode: 'FRA',
      },
      {
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

function checkedIn(actorId: string | null = PILOT_ID) {
  return new PilotCheckedInEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.User,
    actorId,
    aircraftId: '785bdfda-291a-4c11-a5d9-b57b5c0b8e5e',
    airportIds: [],
  });
}

describe('DiscordService', () => {
  let client: { sendMessage: jest.Mock; sendDirectMessage: jest.Mock };
  let queryBus: { execute: jest.Mock };
  let service: DiscordService;
  let discordId: string | null;
  let ofp: { ofpDocumentUrl: string } | null;

  beforeEach(() => {
    discordId = DISCORD_ID;
    ofp = { ofpDocumentUrl: OFP_URL };

    client = { sendMessage: jest.fn(), sendDirectMessage: jest.fn() };
    queryBus = {
      execute: jest.fn().mockImplementation((query: unknown) => {
        if (query instanceof GetUserDiscordIdQuery) {
          return Promise.resolve(discordId);
        }

        if (query instanceof GetFlightQuery) {
          return Promise.resolve(flight());
        }

        if (query instanceof GetOfpQuery) {
          return ofp === null
            ? Promise.reject(new FlightOfpNotFoundError())
            : Promise.resolve(ofp);
        }

        return Promise.reject(new Error('unexpected query'));
      }),
    };

    service = new DiscordService(client as never, queryBus as never);
  });

  it('sends the briefing to the pilot who checked in', async () => {
    await service.onPilotCheckedIn(checkedIn());

    expect(client.sendDirectMessage).toHaveBeenCalledTimes(1);
    const [memberId, message] = client.sendDirectMessage.mock.calls[0];
    expect(memberId).toBe(DISCORD_ID);
    expect(message.type).toBe('briefing');
    expect(message.flightId).toBe(FLIGHT_ID);
    expect(message.content).toContain(':clipboard: **Flight LH 81 briefing**');
    expect(message.content).toContain(
      'Route: **Frankfurt (FRA)** to **New York (JFK)**',
    );
    expect(message.content).toContain('Aircraft: **Airbus A330-900** (D-AIMK)');
    expect(message.content).toContain(
      'Estimated off block: **09:00Z**, on block: **17:25Z**',
    );
  });

  it('attaches the operational flight plan when the flight has one', async () => {
    await service.onPilotCheckedIn(checkedIn());

    const [, message] = client.sendDirectMessage.mock.calls[0];
    expect(message.content).toContain(`[Operational flight plan](${OFP_URL})`);
    expect(message.attachments).toEqual([OFP_URL]);
  });

  it('briefs without a flight plan when the flight has none', async () => {
    ofp = null;

    await service.onPilotCheckedIn(checkedIn());

    const [, message] = client.sendDirectMessage.mock.calls[0];
    expect(message.content).not.toContain('Operational flight plan');
    expect(message.attachments).toEqual([]);
  });

  it('sends nothing when the pilot has no linked Discord account', async () => {
    discordId = null;

    await service.onPilotCheckedIn(checkedIn());

    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('sends nothing when the check-in has no actor', async () => {
    await service.onPilotCheckedIn(checkedIn(null));

    expect(queryBus.execute).not.toHaveBeenCalled();
    expect(client.sendDirectMessage).not.toHaveBeenCalled();
  });

  it('keeps a failing briefing from breaking the check-in', async () => {
    client.sendDirectMessage.mockRejectedValue(new Error('discord is down'));

    await expect(
      service.onPilotCheckedIn(checkedIn()),
    ).resolves.toBeUndefined();
  });

  it('keeps a failing announcement from breaking the boarding start', async () => {
    client.sendMessage.mockRejectedValue(new Error('discord is down'));

    const event = new BoardingWasStartedEvent({
      flightId: FLIGHT_ID,
      scope: FlightEventScope.User,
      actorId: PILOT_ID,
    });

    await expect(service.onBoardingStarted(event)).resolves.toBeUndefined();
  });
});
