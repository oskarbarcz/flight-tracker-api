import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateGateRequest } from '../../../infra/http/request/gate.dto';
import { GatesRepository } from '../../../infra/database/gates.repository';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { ParkingPositionsRepository } from '../../../infra/database/parking-positions.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { TerminalNotFoundError } from '../../../model/error/terminal.error';
import { GateNotFoundError } from '../../../model/error/gate.error';
import { ParkingPositionNotFoundError } from '../../../model/error/parking-position.error';

export class UpdateGateCommand {
  constructor(
    public readonly airportId: string,
    public readonly gateId: string,
    public readonly data: UpdateGateRequest,
  ) {}
}

@CommandHandler(UpdateGateCommand)
export class UpdateGateHandler implements ICommandHandler<UpdateGateCommand> {
  constructor(
    private readonly gatesRepository: GatesRepository,
    private readonly terminalsRepository: TerminalsRepository,
    private readonly airportsRepository: AirportsRepository,
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
  ) {}

  async execute(command: UpdateGateCommand): Promise<void> {
    const { airportId, gateId, data } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.gatesRepository.exists(airportId, gateId))) {
      throw new GateNotFoundError();
    }

    if (
      data.terminalId !== undefined &&
      !(await this.terminalsRepository.exists(airportId, data.terminalId))
    ) {
      throw new TerminalNotFoundError();
    }

    if (
      data.parkingPositionId != null &&
      !(await this.parkingPositionsRepository.exists(
        airportId,
        data.parkingPositionId,
      ))
    ) {
      throw new ParkingPositionNotFoundError();
    }

    await this.gatesRepository.update(gateId, data);
  }
}
