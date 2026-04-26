import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GatesRepository } from '../../infra/database/gates.repository';
import { GateNotAtAirportError } from '../../model/error/gate.error';

export class AssertGateBelongsToAirportCommand {
  constructor(
    public readonly airportId: string,
    public readonly gateId: string,
  ) {}
}

@CommandHandler(AssertGateBelongsToAirportCommand)
export class AssertGateBelongsToAirportHandler implements ICommandHandler<AssertGateBelongsToAirportCommand> {
  constructor(private readonly gatesRepository: GatesRepository) {}

  async execute(command: AssertGateBelongsToAirportCommand): Promise<void> {
    const { airportId, gateId } = command;
    if (!(await this.gatesRepository.exists(airportId, gateId))) {
      throw new GateNotAtAirportError();
    }
  }
}
