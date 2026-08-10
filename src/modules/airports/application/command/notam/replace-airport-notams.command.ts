import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  AirportNotamsRepository,
  AirportNotamsToStore,
} from '../../../infra/database/airport-notams.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import {
  AirportNotamData,
  AirportNotams,
} from '../../../model/airport-notam.model';

export class ReplaceAirportNotamsCommand {
  constructor(public readonly airports: AirportNotams[]) {}
}

@CommandHandler(ReplaceAirportNotamsCommand)
export class ReplaceAirportNotamsHandler implements ICommandHandler<ReplaceAirportNotamsCommand> {
  constructor(
    private readonly notamsRepository: AirportNotamsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: ReplaceAirportNotamsCommand): Promise<void> {
    const notamsByIcaoCode = this.mergeByIcaoCode(command.airports);

    if (notamsByIcaoCode.size === 0) {
      return;
    }

    const airportIds = await this.airportsRepository.findIdsByIcaoCodes([
      ...notamsByIcaoCode.keys(),
    ]);

    const entries: AirportNotamsToStore[] = [];
    for (const [icaoCode, notams] of notamsByIcaoCode) {
      const airportId = airportIds.get(icaoCode);

      if (airportId) {
        entries.push({ airportId, notams });
      }
    }

    await this.notamsRepository.replaceForAirports(entries);
  }

  private mergeByIcaoCode(
    airports: AirportNotams[],
  ): Map<string, AirportNotamData[]> {
    const merged = new Map<string, Map<string, AirportNotamData>>();

    for (const airport of airports) {
      const byNotamId = merged.get(airport.icaoCode) ?? new Map();

      for (const notam of airport.notams) {
        if (!byNotamId.has(notam.notamId)) {
          byNotamId.set(notam.notamId, notam);
        }
      }

      merged.set(airport.icaoCode, byNotamId);
    }

    return new Map(
      [...merged].map(([icaoCode, byNotamId]) => [
        icaoCode,
        [...byNotamId.values()],
      ]),
    );
  }
}
