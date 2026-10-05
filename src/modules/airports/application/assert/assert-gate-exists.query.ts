import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { GatesRepository } from '../../infra/database/gates.repository';
import { AirportNotFoundError } from '../../model/error/airport.error';
import { GateNotFoundError } from '../../model/error/gate.error';

export class AssertGateExistsQuery {
  constructor(
    public readonly airportId: string,
    public readonly gateId: string,
  ) {}
}

@QueryHandler(AssertGateExistsQuery)
export class AssertGateExistsHandler implements IQueryHandler<AssertGateExistsQuery> {
  constructor(
    private readonly airportsRepository: AirportsRepository,
    private readonly gatesRepository: GatesRepository,
  ) {}

  async execute(query: AssertGateExistsQuery): Promise<void> {
    const { airportId, gateId } = query;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.gatesRepository.exists(airportId, gateId))) {
      throw new GateNotFoundError();
    }
  }
}
