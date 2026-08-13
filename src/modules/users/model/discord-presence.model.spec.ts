import {
  buildDiscordPresence,
  PresenceFlight,
  DISCORD_PRESENCE_LARGE_IMAGE_KEY,
  DISCORD_PRESENCE_SMALL_IMAGE_KEY,
} from './discord-presence.model';
import { FlightStatus } from '../../flights/model/flight.model';
import { AirportType } from '../../airports/model/airport.model';
import { FullTimesheet } from '../../flights/model/timesheet.model';

const schedule = {
  offBlockTime: new Date('2026-08-13T11:40:00.000Z'),
  takeoffTime: new Date('2026-08-13T12:00:00.000Z'),
  arrivalTime: new Date('2026-08-13T13:30:00.000Z'),
  onBlockTime: new Date('2026-08-13T13:45:00.000Z'),
};

const airports = [
  { type: AirportType.Departure, city: 'Barcelona', iataCode: 'BCN' },
  { type: AirportType.Destination, city: 'New York', iataCode: 'JFK' },
  {
    type: AirportType.DestinationAlternate,
    city: 'Boston',
    iataCode: 'BOS',
  },
];

function flight(overrides: Partial<PresenceFlight> = {}): PresenceFlight {
  return {
    status: FlightStatus.InCruise,
    timesheet: { estimated: schedule, scheduled: schedule } as FullTimesheet,
    airports,
    ...overrides,
  };
}

describe('buildDiscordPresence', () => {
  it('publishes the route, the estimated block window and both asset keys', () => {
    expect(buildDiscordPresence(flight())).toEqual({
      state: 'Cruise, landing at 13:30 UTC',
      details: 'Barcelona (BCN) -> New York (JFK)',
      startTimestamp: new Date('2026-08-13T11:40:00.000Z'),
      endTimestamp: new Date('2026-08-13T13:30:00.000Z'),
      smallImageKey: DISCORD_PRESENCE_SMALL_IMAGE_KEY,
      largeImageKey: DISCORD_PRESENCE_LARGE_IMAGE_KEY,
    });
  });

  it('ignores airports that are neither the departure nor the destination', () => {
    const presence = buildDiscordPresence(flight());

    expect(presence?.details).toBe('Barcelona (BCN) -> New York (JFK)');
  });

  it.each([
    [FlightStatus.Created, 'Planned, takeoff at 12:00 UTC'],
    [FlightStatus.Ready, 'Ready, takeoff at 12:00 UTC'],
    [FlightStatus.CheckedIn, 'Checked in, takeoff at 12:00 UTC'],
    [FlightStatus.BoardingStarted, 'Boarding, takeoff at 12:00 UTC'],
    [FlightStatus.BoardingFinished, 'Boarding complete, takeoff at 12:00 UTC'],
    [FlightStatus.TaxiingOut, 'Taxiing out, takeoff at 12:00 UTC'],
  ])('counts down to takeoff while %s', (status, expected) => {
    expect(buildDiscordPresence(flight({ status }))?.state).toBe(expected);
  });

  it.each([
    [FlightStatus.TaxiingIn, 'Taxiing in'],
    [FlightStatus.OnBlock, 'On block'],
    [FlightStatus.OffboardingStarted, 'Offboarding'],
    [FlightStatus.OffboardingFinished, 'Offboarding complete'],
    [FlightStatus.Closed, 'Flight closed'],
  ])('states no further time once landed at %s', (status, expected) => {
    expect(buildDiscordPresence(flight({ status }))?.state).toBe(expected);
  });

  it('falls back to the scheduled timesheet when the crew estimated nothing', () => {
    const presence = buildDiscordPresence(
      flight({
        status: FlightStatus.Ready,
        timesheet: { scheduled: schedule } as FullTimesheet,
      }),
    );

    expect(presence).toMatchObject({
      state: 'Ready, takeoff at 12:00 UTC',
      startTimestamp: new Date('2026-08-13T11:40:00.000Z'),
      endTimestamp: new Date('2026-08-13T13:30:00.000Z'),
    });
  });

  it('prefers the estimated timesheet over the scheduled one', () => {
    const presence = buildDiscordPresence(
      flight({
        timesheet: {
          scheduled: schedule,
          estimated: {
            ...schedule,
            arrivalTime: new Date('2026-08-13T14:05:00.000Z'),
          },
        } as FullTimesheet,
      }),
    );

    expect(presence).toMatchObject({
      state: 'Cruise, landing at 14:05 UTC',
      endTimestamp: new Date('2026-08-13T14:05:00.000Z'),
    });
  });

  it('drops the time from the state when it is not known yet', () => {
    const presence = buildDiscordPresence(
      flight({
        timesheet: {
          scheduled: { ...schedule, arrivalTime: null },
        } as FullTimesheet,
      }),
    );

    expect(presence).toMatchObject({
      state: 'Cruise',
      endTimestamp: null,
    });
  });

  it('publishes nothing for a flight with no destination', () => {
    expect(
      buildDiscordPresence(
        flight({
          airports: [
            { type: AirportType.Departure, city: 'Barcelona', iataCode: 'BCN' },
          ],
        }),
      ),
    ).toBeNull();
  });
});
