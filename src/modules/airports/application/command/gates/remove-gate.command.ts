import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GatesRepository } from '../../../infra/database/gates.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { GateNotFoundError } from '../../../model/error/gate.error';

export class RemoveGateCommand {
  constructor(
    public readonly airportId: string,
    public readonly gateId: string,
  ) {}
}

@CommandHandler(RemoveGateCommand)
export class RemoveGateHandler implements ICommandHandler<RemoveGateCommand> {
  constructor(
    private readonly gatesRepository: GatesRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: RemoveGateCommand): Promise<void> {
    const { airportId, gateId } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.gatesRepository.exists(airportId, gateId))) {
      throw new GateNotFoundError();
    }

    await this.gatesRepository.remove(gateId);
  }
}
