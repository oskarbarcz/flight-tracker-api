import {
  AlternateAirportCandidate,
  CreateFlightFromSimbriefHandler,
} from './create-flight-from-simbrief.command';
import { AirportType } from '../../../airports/model/airport.model';
import { FlightServiceType } from '../../model/flight.model';
import {
  Crew,
  OperationalFlightPlan,
} from '../../../../core/provider/simbrief/type/simbrief.types';
import { CrewMember } from '../../../crew/application/command/assign-crew-to-flight.command';
import { CrewRole } from '../../../crew/model/crew.model';

function ofpWithPaxCount(paxCount?: string): OperationalFlightPlan {
  return { weights: { pax_count: paxCount } } as OperationalFlightPlan;
}

function ofpWithCrew(crew: unknown): OperationalFlightPlan {
  return { crew } as OperationalFlightPlan;
}

function buildHandler(): CreateFlightFromSimbriefHandler {
  return new CreateFlightFromSimbriefHandler(
    undefined as never,
    undefined as never,
    undefined as never,
    undefined as never,
    undefined as never,
    undefined as never,
  );
}

describe('CreateFlightFromSimbriefHandler service type derivation', () => {
  let handler: CreateFlightFromSimbriefHandler;

  function derive(paxCount?: string): FlightServiceType {
    return (
      handler as unknown as {
        deriveServiceType: (ofp: OperationalFlightPlan) => FlightServiceType;
      }
    ).deriveServiceType(ofpWithPaxCount(paxCount));
  }

  beforeEach(() => {
    handler = buildHandler();
  });

  it('derives a cargo service when the plan reports no passengers', () => {
    expect(derive('0')).toBe(FlightServiceType.Cargo);
  });

  it('derives a passenger service when the plan reports passengers', () => {
    expect(derive('348')).toBe(FlightServiceType.Passenger);
  });

  it('derives a passenger service when the plan omits the passenger count', () => {
    expect(derive(undefined)).toBe(FlightServiceType.Passenger);
  });

  it('derives a passenger service when the reported count is blank', () => {
    expect(derive('   ')).toBe(FlightServiceType.Passenger);
  });

  it('derives a passenger service when the reported count is not a number', () => {
    expect(derive('n/a')).toBe(FlightServiceType.Passenger);
  });
});

describe('CreateFlightFromSimbriefHandler crew collection', () => {
  let handler: CreateFlightFromSimbriefHandler;

  function collect(crew: unknown): CrewMember[] {
    return (
      handler as unknown as {
        collectCrewMembers: (ofp: OperationalFlightPlan) => CrewMember[];
      }
    ).collectCrewMembers(ofpWithCrew(crew));
  }

  function countCabinCrew(crew: unknown): number {
    return (
      handler as unknown as { countCabinCrew: (crew?: Crew) => number }
    ).countCabinCrew(crew as Crew);
  }

  beforeEach(() => {
    handler = buildHandler();
  });

  it('collects the reported crew members', () => {
    expect(
      collect({ fo: 'jane doe', pu: 'john roe', fa: ['ann poe'] }),
    ).toEqual([
      { role: CrewRole.fo, name: 'jane doe' },
      { role: CrewRole.pu, name: 'john roe' },
      { role: CrewRole.fa, name: 'ann poe' },
    ]);
  });

  it('skips the blank object the plan reports for an unfilled crew field', () => {
    const crew = {
      pilot_id: '371340',
      cpt: '..... .....',
      fo: 'HERBERT ELLISON',
      dx: 'JEANETTE NIXON',
      pu: { '0': '   ' },
    };

    expect(collect(crew)).toEqual([
      { role: CrewRole.fo, name: 'HERBERT ELLISON' },
    ]);
  });

  it('skips crew fields the plan reports as empty objects', () => {
    expect(collect({ fo: {}, pu: {}, fa: {} })).toEqual([]);
  });

  it('skips crew fields the plan reports as blank strings', () => {
    expect(collect({ fo: '   ', pu: '', fa: ['', '  '] })).toEqual([]);
  });

  it('accepts a single flight attendant reported outside of an array', () => {
    expect(collect({ fa: 'ann poe' })).toEqual([
      { role: CrewRole.fa, name: 'ann poe' },
    ]);
  });

  it('accepts flight attendants reported as an index keyed object', () => {
    expect(collect({ fa: { '0': 'ann poe', '1': 'bob roe' } })).toEqual([
      { role: CrewRole.fa, name: 'ann poe' },
      { role: CrewRole.fa, name: 'bob roe' },
    ]);
  });

  it('skips flight attendants reported as blank or missing entries', () => {
    expect(collect({ fa: ['ann poe', {}, null, '  '] })).toEqual([
      { role: CrewRole.fa, name: 'ann poe' },
    ]);
  });

  it('collects no members when the plan omits the crew', () => {
    expect(collect(undefined)).toEqual([]);
  });

  it('counts only the cabin crew the plan actually reports', () => {
    expect(countCabinCrew({ pu: { '0': '   ' }, fa: ['ann poe', {}] })).toBe(1);
    expect(countCabinCrew({ pu: 'john roe', fa: 'ann poe' })).toBe(2);
    expect(countCabinCrew(undefined)).toBe(0);
  });
});

describe('CreateFlightFromSimbriefHandler ETOPS airport roles', () => {
  let handler: CreateFlightFromSimbriefHandler;

  function collect(
    etops: OperationalFlightPlan['etops'],
  ): AlternateAirportCandidate[] {
    return (
      handler as unknown as {
        collectAlternateCandidates: (
          ofp: OperationalFlightPlan,
        ) => AlternateAirportCandidate[];
      }
    ).collectAlternateCandidates({ etops } as OperationalFlightPlan);
  }

  function typeOf(
    candidates: AlternateAirportCandidate[],
    icaoCode: string,
  ): AirportType | undefined {
    return candidates.find((candidate) => candidate.icaoCode === icaoCode)
      ?.type;
  }

  beforeEach(() => {
    handler = buildHandler();
  });

  it('maps the entry point to its adequate airport and its diversion airport apart', () => {
    const candidates = collect({
      entry: { icao_code: 'CYYT', div_airport: { icao_code: 'CYQX' } },
      exit: { icao_code: 'EINN', div_airport: { icao_code: 'EINN' } },
    });

    expect(typeOf(candidates, 'CYYT')).toBe(AirportType.EtopsEntry);
    expect(typeOf(candidates, 'CYQX')).toBe(AirportType.EtopsSuitable);
  });

  it('keeps the adequate role when one airport is both the exit and its own diversion airport', () => {
    const candidates = collect({
      entry: { icao_code: 'CYYT', div_airport: { icao_code: 'CYQX' } },
      exit: { icao_code: 'EINN', div_airport: { icao_code: 'EINN' } },
    });

    expect(
      candidates.filter((candidate) => candidate.icaoCode === 'EINN'),
    ).toHaveLength(1);
    expect(typeOf(candidates, 'EINN')).toBe(AirportType.EtopsExit);
  });

  it('imports the suitable airports the plan publishes', () => {
    const candidates = collect({
      entry: { icao_code: 'CYYT' },
      exit: { icao_code: 'EINN' },
      suitable_airport: [{ icao_code: 'CYQX' }, { icao_code: 'BIKF' }],
    });

    expect(typeOf(candidates, 'CYQX')).toBe(AirportType.EtopsSuitable);
    expect(typeOf(candidates, 'BIKF')).toBe(AirportType.EtopsSuitable);
  });

  it('imports an airport once when it is named as both a diversion target and a suitable airport', () => {
    const candidates = collect({
      entry: { icao_code: 'CYYT', div_airport: { icao_code: 'CYQX' } },
      exit: { icao_code: 'EINN' },
      suitable_airport: { icao_code: 'CYQX' },
    });

    expect(
      candidates.filter((candidate) => candidate.icaoCode === 'CYQX'),
    ).toHaveLength(1);
  });

  it('collects nothing from a plan without an ETOPS section', () => {
    expect(collect(undefined)).toEqual([]);
  });
});
