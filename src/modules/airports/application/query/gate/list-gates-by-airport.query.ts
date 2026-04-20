import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GatesRepository } from '../../../infra/database/gates.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { GetGateResponse } from '../../../infra/http/request/gate.dto';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { Gate } from '../../../model/gate.model';

export class ListGatesByAirportQuery extends Query<GetGateResponse[]> {
  constructor(public readonly airportId: string) {
    super();
  }
}

@QueryHandler(ListGatesByAirportQuery)
export class ListGatesByAirportHandler implements IQueryHandler<ListGatesByAirportQuery> {
  constructor(
    private readonly gatesRepository: GatesRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(query: ListGatesByAirportQuery): Promise<GetGateResponse[]> {
    if (!(await this.airportsRepository.exists(query.airportId))) {
      throw new AirportNotFoundError();
    }

    const gates = await this.gatesRepository.findAll(query.airportId);
    return gates as Gate[];
  }
}
