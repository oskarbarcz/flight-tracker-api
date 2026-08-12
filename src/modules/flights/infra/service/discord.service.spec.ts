import { DiscordService } from './discord.service';
import { GetFlightQuery } from '../../application/query/get-flight.query';
import { GetOfpQuery } from '../../application/query/get-ofp.query';
import { GetUserDiscordIdQuery } from '../../../users/application/query/get-user-discord-id.query';
import { GetUserDiscordSettingsQuery } from '../../../users/application/query/get-user-discord-settings.query';
import { GetUserWeatherSourceQuery } from '../../../users/application/query/get-user-weather-source.query';
import { GetAirportWeatherQuery } from '../../../airports/application/query/weather/get-airport-weather.query';
import { RefreshWeatherCommand } from '../../../airports/application/command/weather/refresh-weather.command';
import {
  GetAirportWeatherResponse,
  WeatherInformationType,
  WeatherSource,
} from '../../../airports/model/airport-weather.model';
import { FlightOfpNotFoundError } from '../../model/error/flight.error';
import { AirportType } from '../../../airports/model/airport.model';
import {
  BoardingWasStartedEvent,
  PilotCheckedInEvent,
} from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';

const FLIGHT_ID = 'b3899775-278e-4496-add1-21385a13d93e';
const PILOT_ID = '629be07f-5e65-429a-9d69-d34b99185f50';
const DEPARTURE_ID = '0f0d1f8f-2b3e-4a3a-9d70-8ac1d2e5f6a1';
const DISCORD_ID = '100000000000000100';
const OFP_URL = 'https://www.simbrief.com/ofp/flightplans/EDDFKJFK_PDF.pdf';
const FRONTEND_BASE_URL = 'https://flights.example.com';

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
        id: DEPARTURE_ID,
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
        takeoffTime: new Date('2025-01-05T09:20:00.000Z'),
        arrivalTime: new Date('2025-01-05T17:10:00.000Z'),
        onBlockTime: new Date('2025-01-05T17:25:00.000Z'),
      },
    },
    loadsheets: { preliminary: { passengers: 293 } },
  };
}

function report(
  informationType: WeatherInformationType,
  source: WeatherSource,
  content: string,
): GetAirportWeatherResponse {
  return {
    id: `${source}-${informationType}`,
    source,
    informationType,
    content,
    lastFetched: new Date('2025-01-05T08:55:00.000Z'),
  };
}

function checkedIn(actorId: string | null = PILOT_ID) {
  return new PilotCheckedInEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.User,
    actorId,
    aircraftId: '785bdfda-291a-4c11-a5d9-b57b5c0b8e5e',
    airportIds: [DEPARTURE_ID],
  });
}

describe('DiscordService', () => {
  let client: { sendMessage: jest.Mock; sendDirectMessage: jest.Mock };
  let queryBus: { execute: jest.Mock };
  let commandBus: { execute: jest.Mock };
  let service: DiscordService;
  let discordId: string | null;
  let briefingsEnabled: boolean;
  let weatherSource: WeatherSource;
  let weather: GetAirportWeatherResponse[];
  let ofp: { ofpDocumentUrl: string } | null;

  beforeEach(() => {
    discordId = DISCORD_ID;
    briefingsEnabled = true;
    weatherSource = WeatherSource.SayIntentions;
    weather = [
      report(
        WeatherInformationType.Atis,
        WeatherSource.SayIntentions,
        'FRANKFURT INFORMATION K',
      ),
      report(
        WeatherInformationType.Metar,
        WeatherSource.SayIntentions,
        'EDDF 050850Z 24008KT',
      ),
      report(
        WeatherInformationType.Metar,
        WeatherSource.AviationWeatherGov,
        'METAR EDDF 050850Z 24008KT',
      ),
    ];
    ofp = { ofpDocumentUrl: OFP_URL };

    client = { sendMessage: jest.fn(), sendDirectMessage: jest.fn() };
    commandBus = { execute: jest.fn().mockResolvedValue(undefined) };
    queryBus = {
      execute: jest.fn().mockImplementation((query: unknown) => {
        if (query instanceof GetUserDiscordSettingsQuery) {
          return Promise.resolve({ briefingsEnabled });
        }

        if (query instanceof GetUserDiscordIdQuery) {
          return Promise.resolve(discordId);
        }

        if (query instanceof GetFlightQuery) {
          return Promise.resolve(flight());
        }

        if (query instanceof GetAirportWeatherQuery) {
          return Promise.resolve(weather);
        }

        if (query instanceof GetUserWeatherSourceQuery) {
          return Promise.resolve(weatherSource);
        }

        if (query instanceof GetOfpQuery) {
          return ofp === null
            ? Promise.reject(new FlightOfpNotFoundError())
            : Promise.resolve(ofp);
        }

        return Promise.reject(new Error('unexpected query'));
      }),
    };

    service = new DiscordService(
      client as never,
      queryBus as never,
      commandBus as never,
      { getOrThrow: () => FRONTEND_BASE_URL } as never,
    );
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
    expect(message.content).toContain('Aircraft: **D-AIMK** (Airbus A330-900)');
    expect(message.content).toContain('out: 09:00z');
    expect(message.content).toContain('in:  17:25z');
    expect(message.content).toContain('block: 8h 25m');
    expect(message.content).toContain(
      `[**Flight Tracker app**](${FRONTEND_BASE_URL}/flight/${FLIGHT_ID}).`,
    );
  });

  it('briefs the departure weather', async () => {
    await service.onPilotCheckedIn(checkedIn());

    const [, message] = client.sendDirectMessage.mock.calls[0];
    expect(message.content).toContain('ATIS for FRA:');
    expect(message.content).toContain('FRANKFURT INFORMATION K');
    expect(message.content).toContain('METAR:');
    expect(message.content).not.toContain('TAF:');
  });

  it('prefers the reports published by the source the pilot defaults to', async () => {
    weatherSource = WeatherSource.AviationWeatherGov;

    await service.onPilotCheckedIn(checkedIn());

    const [, message] = client.sendDirectMessage.mock.calls[0];
    expect(message.content).toContain('METAR EDDF 050850Z 24008KT');
    expect(message.content).toContain('FRANKFURT INFORMATION K');
  });

  it('refreshes the departure weather when nothing is stored yet', async () => {
    const stored = weather;
    weather = [];
    commandBus.execute.mockImplementation((command: unknown) => {
      if (command instanceof RefreshWeatherCommand) {
        weather = stored;
      }

      return Promise.resolve(undefined);
    });

    await service.onPilotCheckedIn(checkedIn());

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const [command] = commandBus.execute.mock.calls[0];
    expect(command).toBeInstanceOf(RefreshWeatherCommand);
    expect(command.airportIds).toEqual([DEPARTURE_ID]);

    const [, message] = client.sendDirectMessage.mock.calls[0];
    expect(message.content).toContain('ATIS for FRA:');
  });

  it('briefs without weather when the refresh brings nothing back', async () => {
    weather = [];

    await service.onPilotCheckedIn(checkedIn());

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const [, message] = client.sendDirectMessage.mock.calls[0];
    expect(message.content).not.toContain('ATIS');
    expect(message.content).not.toContain('METAR');
  });

  it('does not refresh the weather when reports are already stored', async () => {
    await service.onPilotCheckedIn(checkedIn());

    expect(commandBus.execute).not.toHaveBeenCalled();
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

  it('sends nothing when the pilot disabled briefings', async () => {
    briefingsEnabled = false;

    await service.onPilotCheckedIn(checkedIn());

    expect(client.sendDirectMessage).not.toHaveBeenCalled();
    expect(queryBus.execute).toHaveBeenCalledTimes(1);
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
