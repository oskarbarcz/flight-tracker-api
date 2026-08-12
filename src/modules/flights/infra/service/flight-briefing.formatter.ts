import { Schedule } from '../../model/timesheet.model';

const FLIGHT_TRACKER_EMOJI = '<:ft:1436299102626386031>';

export type BriefingAirport = {
  city: string;
  iataCode: string;
};

export type BriefingAircraft = {
  registration: string;
  type: string;
};

export type BriefingWeather = {
  atis?: string;
  metar?: string;
  taf?: string;
};

export type BriefingInput = {
  flightNumber: string;
  departure: BriefingAirport;
  destination: BriefingAirport;
  aircraft: BriefingAircraft;
  schedule?: Partial<Schedule>;
  weather: BriefingWeather;
  ofpDocumentUrl: string | null;
  flightUrl: string;
};

export function formatFlightBriefing(input: BriefingInput): string {
  const sections: string[] = [
    `:clipboard: **Flight ${formatFlightNumber(input.flightNumber)} briefing**`,
    [
      `Route: **${input.departure.city} (${input.departure.iataCode})**` +
        ` to **${input.destination.city} (${input.destination.iataCode})**`,
      `Aircraft: **${input.aircraft.registration}** (${input.aircraft.type})`,
    ].join('\n'),
  ];

  const schedule = formatSchedule(input.schedule);
  if (schedule !== null) {
    sections.push(`Estimated schedule:\n${codeBlock(schedule)}`);
  }

  const { atis, metar, taf } = input.weather;
  if (atis !== undefined) {
    sections.push(`ATIS for ${input.departure.iataCode}:\n${codeBlock(atis)}`);
  }
  if (metar !== undefined) {
    sections.push(`METAR:\n${codeBlock(metar)}`);
  }
  if (taf !== undefined) {
    sections.push(`TAF:\n${codeBlock(taf)}`);
  }

  if (input.ofpDocumentUrl !== null) {
    sections.push(`[Operational flight plan](${input.ofpDocumentUrl})`);
  }

  sections.push(
    `Manage your flight in the ${FLIGHT_TRACKER_EMOJI} ` +
      `[**Flight Tracker app**](${input.flightUrl}).`,
  );

  return sections.join('\n\n');
}

export function formatFlightNumber(flightNumber: string): string {
  return flightNumber.replace(/^(.{2})/, '$1 ');
}

export function formatBlockTime(offBlockTime: Date, onBlockTime: Date): string {
  const minutes = Math.floor(
    (onBlockTime.getTime() - offBlockTime.getTime()) / 60000,
  );

  return `${Math.floor(minutes / 60)}h ${(minutes % 60)
    .toString()
    .padStart(2, '0')}m`;
}

function formatSchedule(schedule?: Partial<Schedule>): string | null {
  if (!schedule) {
    return null;
  }

  const lines = [
    formatScheduleLine('out', schedule.offBlockTime),
    formatScheduleLine('off', schedule.takeoffTime),
    formatScheduleLine('on', schedule.arrivalTime),
    formatScheduleLine('in', schedule.onBlockTime),
  ].filter((line): line is string => line !== null);

  if (lines.length === 0) {
    return null;
  }

  if (schedule.offBlockTime && schedule.onBlockTime) {
    lines.push(
      '',
      `block: ${formatBlockTime(schedule.offBlockTime, schedule.onBlockTime)}`,
    );
  }

  return lines.join('\n');
}

function formatScheduleLine(
  label: string,
  time: Date | null | undefined,
): string | null {
  if (!time) {
    return null;
  }

  return `${`${label}:`.padEnd(4)} ${formatTime(time)}`;
}

function formatTime(time: Date): string {
  return `${time.toISOString().slice(11, 16)}z`;
}

function codeBlock(content: string): string {
  return ['```', content, '```'].join('\n');
}
