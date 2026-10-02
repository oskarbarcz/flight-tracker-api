import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { CitiesRepository } from '../../infra/database/cities.repository';
import { CityNotFoundError } from '../../model/error/city.error';

export class ReassignAirportCityCommand {
  constructor(
    public readonly airportId: string,
    public readonly cityId: string,
  ) {}
}

@CommandHandler(ReassignAirportCityCommand)
export class ReassignAirportCityHandler implements ICommandHandler<ReassignAirportCityCommand> {
  constructor(
    private readonly repository: AirportsRepository,
    private readonly cities: CitiesRepository,
  ) {}

  async execute(command: ReassignAirportCityCommand): Promise<void> {
    const { airportId, cityId } = command;

    const city = await this.cities.findById(cityId);

    if (!city) {
      throw new CityNotFoundError();
    }

    await this.repository.update(airportId, {}, cityId);
  }
}
