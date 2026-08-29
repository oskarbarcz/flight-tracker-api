import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAirportRequest } from '../../infra/http/request/airport.dto';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { CitiesRepository } from '../../infra/database/cities.repository';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { CityWasCreatedEvent } from '../../../../core/domain/events/dto/city.event';

export class CreateAirportCommand {
  constructor(
    public readonly airportId: string,
    public readonly data: CreateAirportRequest,
  ) {}
}

@CommandHandler(CreateAirportCommand)
export class CreateAirportHandler implements ICommandHandler<CreateAirportCommand> {
  constructor(
    private readonly repository: AirportsRepository,
    private readonly cities: CitiesRepository,
    private readonly eventEmitter: DomainEventEmitter,
  ) {}

  async execute(command: CreateAirportCommand): Promise<void> {
    const { airportId, data } = command;

    const city = await this.cities.findOrCreate(data.city, data.country);
    await this.repository.create(airportId, data, city.id);

    if (city.created) {
      const event = new CityWasCreatedEvent({
        cityId: city.id,
        name: data.city,
        country: data.country,
      });
      this.eventEmitter.emit(event);
    }
  }
}
