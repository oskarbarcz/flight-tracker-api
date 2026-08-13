import { ApiProperty } from '@nestjs/swagger';
import { FlightStatus } from '../../flights/model/flight.model';
import { AirportType } from '../../airports/model/airport.model';
import { FullTimesheet, Schedule } from '../../flights/model/timesheet.model';

export const DISCORD_PRESENCE_SMALL_IMAGE_KEY = 'flight-tracker';
export const DISCORD_PRESENCE_LARGE_IMAGE_KEY = 'msfs 2024';

const STATUS_LABEL: Record<FlightStatus, string> = {
  [FlightStatus.Created]: 'Planned',
  [FlightStatus.Ready]: 'Ready',
  [FlightStatus.CheckedIn]: 'Checked in',
  [FlightStatus.BoardingStarted]: 'Boarding',
  [FlightStatus.BoardingFinished]: 'Boarding complete',
  [FlightStatus.TaxiingOut]: 'Taxiing out',
  [FlightStatus.InCruise]: 'Cruise',
  [FlightStatus.TaxiingIn]: 'Taxiing in',
  [FlightStatus.OnBlock]: 'On block',
  [FlightStatus.OffboardingStarted]: 'Offboarding',
  [FlightStatus.OffboardingFinished]: 'Offboarding complete',
  [FlightStatus.Closed]: 'Flight closed',
};

const AWAITING_TAKEOFF: ReadonlySet<FlightStatus> = new Set([
  FlightStatus.Created,
  FlightStatus.Ready,
  FlightStatus.CheckedIn,
  FlightStatus.BoardingStarted,
  FlightStatus.BoardingFinished,
  FlightStatus.TaxiingOut,
]);

export type PresenceAirport = {
  type: AirportType;
  city: string;
  iataCode: string;
};

export type PresenceFlight = {
  status: FlightStatus;
  timesheet: FullTimesheet;
  airports: PresenceAirport[];
};

export class DiscordPresence {
  @ApiProperty({
    description:
      'Flight status with the time it is next due at, ready to show as the activity state',
    example: 'Cruise, landing at 13:30 UTC',
  })
  state!: string;

  @ApiProperty({
    description: 'Route of the flight, ready to show as the activity details',
    example: 'Barcelona (BCN) -> New York (JFK)',
  })
  details!: string;

  @ApiProperty({
    description:
      'Estimated off-block time, the moment the activity counts up from',
    example: '2026-08-13T11:40:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  startTimestamp!: Date | null;

  @ApiProperty({
    description:
      'Estimated landing time, the moment the activity counts down to',
    example: '2026-08-13T13:30:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  endTimestamp!: Date | null;

  @ApiProperty({
    description: 'Asset key of the small activity image',
    example: DISCORD_PRESENCE_SMALL_IMAGE_KEY,
  })
  smallImageKey!: string;

  @ApiProperty({
    description: 'Asset key of the large activity image',
    example: DISCORD_PRESENCE_LARGE_IMAGE_KEY,
  })
  largeImageKey!: string;
}

export function buildDiscordPresence(
  flight: PresenceFlight,
): DiscordPresence | null {
  const departure = findAirport(flight.airports, AirportType.Departure);
  const destination = findAirport(flight.airports, AirportType.Destination);

  if (!departure || !destination) {
    return null;
  }

  const schedule = resolveSchedule(flight.timesheet);

  return {
    state: buildState(flight.status, schedule),
    details: `${formatAirport(departure)} -> ${formatAirport(destination)}`,
    startTimestamp: schedule?.offBlockTime ?? null,
    endTimestamp: schedule?.arrivalTime ?? null,
    smallImageKey: DISCORD_PRESENCE_SMALL_IMAGE_KEY,
    largeImageKey: DISCORD_PRESENCE_LARGE_IMAGE_KEY,
  };
}

function findAirport(
  airports: PresenceAirport[],
  type: AirportType,
): PresenceAirport | undefined {
  return airports.find((airport) => airport.type === type);
}

function formatAirport(airport: PresenceAirport): string {
  return `${airport.city} (${airport.iataCode})`;
}

function resolveSchedule(
  timesheet: FullTimesheet,
): Partial<Schedule> | undefined {
  return timesheet.estimated ?? timesheet.scheduled;
}

function buildState(
  status: FlightStatus,
  schedule: Partial<Schedule> | undefined,
): string {
  const label = STATUS_LABEL[status];

  if (AWAITING_TAKEOFF.has(status)) {
    return appendTime(label, 'takeoff', schedule?.takeoffTime);
  }

  if (status === FlightStatus.InCruise) {
    return appendTime(label, 'landing', schedule?.arrivalTime);
  }

  return label;
}

function appendTime(
  label: string,
  event: 'takeoff' | 'landing',
  time: Date | null | undefined,
): string {
  if (!time) {
    return label;
  }

  return `${label}, ${event} at ${formatUtcTime(time)} UTC`;
}

function formatUtcTime(time: Date): string {
  return new Date(time).toISOString().slice(11, 16);
}
