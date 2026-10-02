import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../core/errors/domain-error';
import { AssertAirportExistsQuery } from '../../../airports/application/assert/assert-airport-exists.query';
import { AssertCityExistsQuery } from '../../../airports/application/assert/assert-city-exists.query';
import { GetAirportByIdQuery } from '../../../airports/application/query/get-airport-by-id.query';
import { UpdateAirportCommand } from '../../../airports/application/command/update-airport.command';
import { ReassignAirportCityCommand } from '../../../airports/application/command/reassign-airport-city.command';
import { ChangeRequestTarget } from '../../model/change-request-target';
import {
  ChangeRequestChanges,
  ChangeRequestResource,
} from '../../model/change-request.model';
import { AirportValues } from '../../model/airport-change.model';
import { ChangeRequestTargetNotFoundError } from '../../model/error/change-request.error';

type AirportResource = typeof ChangeRequestResource.airport;

@Injectable()
export class AirportChangeRequestTarget implements ChangeRequestTarget<AirportResource> {
  readonly resource = ChangeRequestResource.airport;
  readonly fields = [
    'name',
    'continent',
    'country',
    'timezone',
    'cityId',
    'location',
    'shape',
  ] as const satisfies readonly (keyof AirportValues)[];

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async validate(
    targetId: string,
    changes: ChangeRequestChanges<AirportResource>,
  ): Promise<void> {
    const airportQuery = new AssertAirportExistsQuery(targetId);
    await this.queryBus.execute(airportQuery);

    if (changes.cityId !== undefined) {
      const cityQuery = new AssertCityExistsQuery(changes.cityId);
      await this.queryBus.execute(cityQuery);
    }
  }

  async read(targetId: string): Promise<AirportValues> {
    const query = new GetAirportByIdQuery(targetId);
    const airport = await this.queryBus.execute(query).catch((error) => {
      if (error instanceof NotFoundError) {
        throw new ChangeRequestTargetNotFoundError();
      }
      throw error;
    });

    return {
      name: airport.name,
      continent: airport.continent,
      country: airport.country.code,
      timezone: airport.timezone,
      cityId: airport.city.id,
      location: airport.location,
      shape: airport.shape ?? null,
    };
  }

  async apply(
    targetId: string,
    changes: ChangeRequestChanges<AirportResource>,
  ): Promise<void> {
    const { cityId, ...update } = changes;

    if (Object.keys(update).length > 0) {
      const command = new UpdateAirportCommand(targetId, update);
      await this.commandBus.execute(command);
    }

    if (cityId !== undefined) {
      const command = new ReassignAirportCityCommand(targetId, cityId);
      await this.commandBus.execute(command);
    }
  }
}
