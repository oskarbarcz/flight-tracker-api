import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { SkyLinkClient } from '../../../../core/provider/skylink/client/skylink.client';
import { SkylinkAirportResponse } from '../../../../core/provider/skylink/type/skylink.types';
import { CreateAirportRequest } from '../../infra/http/request/airport.dto';
import { Continent, Coordinates } from '../../model/airport.model';

export class ImportAirportByIcaoCommand {
  constructor(public readonly icaoCode: string) {}
}

// SkyLink returns an IANA timezone but no continent, so it is inferred from the
// timezone area. The Americas are the only area that spans two of our
// continents, so those zones are resolved explicitly; every other IANA area
// maps cleanly onto a single continent.
const SOUTH_AMERICAN_TIMEZONES = new Set([
  'America/Araguaina',
  'America/Asuncion',
  'America/Bahia',
  'America/Belem',
  'America/Boa_Vista',
  'America/Bogota',
  'America/Campo_Grande',
  'America/Caracas',
  'America/Cayenne',
  'America/Cuiaba',
  'America/Eirunepe',
  'America/Fortaleza',
  'America/Guayaquil',
  'America/Guyana',
  'America/La_Paz',
  'America/Lima',
  'America/Maceio',
  'America/Manaus',
  'America/Montevideo',
  'America/Noronha',
  'America/Paramaribo',
  'America/Porto_Velho',
  'America/Punta_Arenas',
  'America/Recife',
  'America/Rio_Branco',
  'America/Santarem',
  'America/Santiago',
  'America/Sao_Paulo',
]);

const CONTINENT_BY_TIMEZONE_AREA: Record<string, Continent> = {
  Africa: Continent.Africa,
  America: Continent.NorthAmerica,
  Antarctica: Continent.Oceania,
  Arctic: Continent.Europe,
  Asia: Continent.Asia,
  Atlantic: Continent.Europe,
  Australia: Continent.Oceania,
  Europe: Continent.Europe,
  Indian: Continent.Asia,
  Pacific: Continent.Oceania,
};

function resolveContinent(timezone: string): Continent {
  if (
    timezone.startsWith('America/Argentina') ||
    SOUTH_AMERICAN_TIMEZONES.has(timezone)
  ) {
    return Continent.SouthAmerica;
  }

  const area = timezone.split('/')[0];
  return CONTINENT_BY_TIMEZONE_AREA[area] ?? Continent.Europe;
}

@CommandHandler(ImportAirportByIcaoCommand)
export class ImportAirportByIcaoHandler implements ICommandHandler<
  ImportAirportByIcaoCommand,
  string
> {
  constructor(
    private readonly repository: AirportsRepository,
    private readonly skyLink: SkyLinkClient,
  ) {}

  async execute(command: ImportAirportByIcaoCommand): Promise<string> {
    const { icaoCode } = command;

    const existing = await this.repository.findOneBy({ icaoCode });
    if (existing) {
      return existing.id;
    }

    const airport = await this.skyLink.getAirportByIcaoCode(icaoCode);
    const created = await this.repository.create(v4(), this.toRequest(airport));

    return created.id;
  }

  private toRequest(airport: SkylinkAirportResponse): CreateAirportRequest {
    return {
      icaoCode: airport.icao,
      iataCode: airport.iata,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      timezone: airport.timezone,
      continent: resolveContinent(airport.timezone),
      location: {
        latitude: Number(airport.latitude),
        longitude: Number(airport.longitude),
      } as Coordinates,
      shape: null,
    };
  }
}
