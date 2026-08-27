import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAirportResponse } from '../../infra/http/request/airport.dto';
import { AirportsRepository } from '../../infra/database/airports.repository';
import {
  CityRecord,
  CitiesRepository,
} from '../../infra/database/cities.repository';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import {
  CityWasCreatedEvent,
  CityWasRenamedEvent,
} from '../../../../core/domain/events/dto/city.event';

type ResolvedCityChange = {
  id: string;
  created: boolean;
  renamedFrom: CityRecord | null;
};

export class UpdateAirportCommand {
  constructor(
    public readonly airportId: string,
    public readonly data: UpdateAirportResponse,
  ) {}
}

@CommandHandler(UpdateAirportCommand)
export class UpdateAirportHandler implements ICommandHandler<UpdateAirportCommand> {
  constructor(
    private readonly repository: AirportsRepository,
    private readonly cities: CitiesRepository,
    private readonly eventEmitter: DomainEventEmitter,
  ) {}

  async execute(command: UpdateAirportCommand): Promise<void> {
    const { airportId, data } = command;

    if (data.city === undefined) {
      await this.repository.update(airportId, data);
      return;
    }

    const airport = await this.repository.findById(airportId);
    const country = data.country ?? airport.country;

    const city = await this.resolveCity(airport.city.id, data.city, country);
    await this.repository.update(airportId, data, city.id);

    if (city.created) {
      const event = new CityWasCreatedEvent({
        cityId: city.id,
        name: data.city,
        country,
      });
      this.eventEmitter.emit(event);

      return;
    }

    if (city.renamedFrom) {
      const event = new CityWasRenamedEvent({
        cityId: city.id,
        name: data.city,
        country,
        previousName: city.renamedFrom.name,
        previousCountry: city.renamedFrom.country,
      });
      await this.eventEmitter.emitAsync(event);
    }
  }

  private async resolveCity(
    currentCityId: string,
    name: string,
    country: string,
  ): Promise<ResolvedCityChange> {
    const current = await this.cities.findById(currentCityId);

    if (current?.name === name && current?.country === country) {
      return { id: currentCityId, created: false, renamedFrom: null };
    }

    const existing = await this.cities.findOneBy({ name, country });

    if (existing) {
      return { id: existing.id, created: false, renamedFrom: null };
    }

    if (current && (await this.cities.countAirports(current.id)) === 1) {
      await this.cities.rename(current.id, name, country);

      return { id: current.id, created: false, renamedFrom: current };
    }

    const resolved = await this.cities.findOrCreate(name, country);

    return { ...resolved, renamedFrom: null };
  }
}
