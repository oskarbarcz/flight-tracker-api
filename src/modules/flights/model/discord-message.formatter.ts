import { Schedule } from './timesheet.model';

const FLIGHT_TRACKER_EMOJI = '<:ft:1436299102626386031>';

export type MessageAirport = {
  city: string;
  iataCode: string;
};

export type MessageAircraft = {
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
  departure: MessageAirport;
  destination: MessageAirport;
  aircraft: MessageAircraft;
  schedule?: Partial<Schedule>;
  weather: BriefingWeather;
  flightUrl: string;
};

export type AnnouncementInput = {
  flightNumber: string;
  departure: MessageAirport;
  destination: MessageAirport;
  blockTime: string;
  flightUrl: string;
};

export type BoardingAnnouncementInput = AnnouncementInput & {
  passengers?: number;
};

export type LoadsheetKind = 'preliminary' | 'final';

export type MessageCrewMember = {
  name: string;
  role: string;
};

export type MessageLoadsheet = {
  flightCrew: { pilots: number; reliefPilots: number; cabinCrew: number };
  passengers: number;
  cargo: number;
  payload: number;
  zeroFuelWeight: number;
  blockFuel: number;
};

export type LoadsheetInput = {
  kind: LoadsheetKind;
  flightNumber: string;
  crew: MessageCrewMember[];
  loadsheet: MessageLoadsheet;
  flightUrl: string;
};

export type DelayAllocationInput = {
  flightNumber: string;
  delayMinutes: number;
  allocationUrl: string;
};

export type DelayApprovalInput = {
  flightNumber: string;
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

  sections.push(manageLine(input.flightUrl));

  return sections.join('\n\n');
}

export function formatBoardingAnnouncement(
  input: BoardingAnnouncementInput,
): string {
  return (
    `:airplane_departure: :airplane_departure: :airplane_departure:\n\n` +
    `Flight **${formatFlightNumber(input.flightNumber)}**` +
    ` from **${input.departure.city} (${input.departure.iataCode})**` +
    ` to **${input.destination.city} (${input.destination.iataCode})**` +
    ` has started boarding!\n` +
    `Estimated block time: **${input.blockTime}hrs**, ` +
    `Passengers on board: **${input.passengers}**\n\n` +
    `Track flight live on ${FLIGHT_TRACKER_EMOJI} ` +
    `[MyPreflight](${input.flightUrl})!`
  );
}

export function formatArrivalAnnouncement(input: AnnouncementInput): string {
  return (
    `:airplane_arriving: :airplane_arriving: :airplane_arriving:\n\n` +
    `Flight **${formatFlightNumber(input.flightNumber)}**` +
    ` from **${input.departure.city} (${input.departure.iataCode})**` +
    ` to **${input.destination.city} (${input.destination.iataCode})**` +
    ` just arrived!\n` +
    `Actual block time: **${input.blockTime}hrs**\n\n` +
    `See flight path on ${FLIGHT_TRACKER_EMOJI} ` +
    `[MyPreflight](${input.flightUrl})!`
  );
}

export function formatLoadsheet(input: LoadsheetInput): string {
  const { loadsheet } = input;
  const sections: string[] = [
    `:clipboard: **Flight ${formatFlightNumber(input.flightNumber)} ` +
      `${input.kind} loadsheet**`,
  ];

  if (input.crew.length > 0) {
    sections.push(
      `Crew:\n${codeBlock(
        input.crew
          .map(
            (member) => `${member.role.toUpperCase().padEnd(3)} ${member.name}`,
          )
          .join('\n'),
      )}`,
    );
  }

  const { pilots, reliefPilots, cabinCrew } = loadsheet.flightCrew;
  sections.push(
    `Load:\n${codeBlock(
      [
        line('crew', `${pilots} + ${reliefPilots} relief, ${cabinCrew} cabin`),
        line('passengers', loadsheet.passengers),
        line('cargo', tons(loadsheet.cargo)),
        line('payload', tons(loadsheet.payload)),
        line('zero fuel', tons(loadsheet.zeroFuelWeight)),
        line('block fuel', tons(loadsheet.blockFuel)),
      ].join('\n'),
    )}`,
    manageLine(input.flightUrl),
  );

  return sections.join('\n\n');
}

export function formatDelayAllocationRequest(
  input: DelayAllocationInput,
): string {
  return [
    `:hourglass: **Flight ${formatFlightNumber(input.flightNumber)} delay**`,
    `A departure delay of **${input.delayMinutes} minutes** was recorded` +
      ` and has to be allocated.`,
    `Allocate it in the ${FLIGHT_TRACKER_EMOJI} ` +
      `[**MyPreflight app**](${input.allocationUrl}).`,
  ].join('\n\n');
}

export function formatDelayApproval(input: DelayApprovalInput): string {
  return [
    `:white_check_mark: **Flight ${formatFlightNumber(input.flightNumber)} ` +
      `delay approved**`,
    'Operations approved your delay allocation.',
    manageLine(input.flightUrl),
  ].join('\n\n');
}

export function formatFlightNumber(flightNumber: string): string {
  return flightNumber.replace(/^(.{2})/, '$1 ');
}

export function calculateBlockTime(
  offBlockTime: Date,
  onBlockTime: Date,
): string {
  const minutes = blockMinutes(offBlockTime, onBlockTime);

  return [Math.floor(minutes / 60), minutes % 60]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':');
}

export function formatBlockTime(offBlockTime: Date, onBlockTime: Date): string {
  const minutes = blockMinutes(offBlockTime, onBlockTime);

  return `${Math.floor(minutes / 60)}h ${(minutes % 60)
    .toString()
    .padStart(2, '0')}m`;
}

function blockMinutes(offBlockTime: Date, onBlockTime: Date): number {
  return Math.floor((onBlockTime.getTime() - offBlockTime.getTime()) / 60000);
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

function line(label: string, value: string | number): string {
  return `${`${label}:`.padEnd(12)} ${value}`;
}

function tons(value: number): string {
  return `${value} t`;
}

function manageLine(flightUrl: string): string {
  return (
    `Manage your flight in the ${FLIGHT_TRACKER_EMOJI} ` +
    `[**MyPreflight app**](${flightUrl}).`
  );
}
