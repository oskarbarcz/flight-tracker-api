import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GatesRepository } from '../../../infra/database/gates.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { GetGateResponse } from '../../../infra/http/request/gate.dto';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { GateNotFoundError } from '../../../model/error/gate.error';
import { Gate } from '../../../model/gate.model';

export class GetGateByIdQuery extends Query<GetGateResponse> {
  constructor(
    public readonly airportId: string,
    public readonly gateId: string,
  ) {
    super();
  }
}

@QueryHandler(GetGateByIdQuery)
export class GetGateByIdHandler implements IQueryHandler<GetGateByIdQuery> {
  constructor(
    private readonly gatesRepository: GatesRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(query: GetGateByIdQuery): Promise<GetGateResponse> {
    const { airportId, gateId } = query;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    const gate = await this.gatesRepository.findOneBy({
      id: gateId,
      airportId,
    });

    if (!gate) {
      throw new GateNotFoundError();
    }

    return gate as Gate;
  }
}
