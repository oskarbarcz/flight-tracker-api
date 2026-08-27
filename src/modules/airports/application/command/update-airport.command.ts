import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAirportResponse } from '../../infra/http/request/airport.dto';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { CitiesRepository } from '../../infra/database/cities.repository';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { CityWasCreatedEvent } from '../../../../core/domain/events/dto/city.event';

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

    const city = await this.cities.findOrCreate(data.city, country);
    await this.repository.update(airportId, data, city.id);

    if (city.created) {
      const event = new CityWasCreatedEvent({
        cityId: city.id,
        name: data.city,
        country,
      });
      this.eventEmitter.emit(event);
    }
  }
}
