import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';

export class PinFlightCabinLayoutCommand {
  constructor(
    public readonly flightId: string,
    public readonly cabinLayout: string,
    public readonly cabinLayoutRevision: number,
  ) {}
}

@CommandHandler(PinFlightCabinLayoutCommand)
export class PinFlightCabinLayoutHandler implements ICommandHandler<PinFlightCabinLayoutCommand> {
  constructor(private readonly flightsRepository: FlightsRepository) {}

  async execute(command: PinFlightCabinLayoutCommand): Promise<void> {
    await this.flightsRepository.pinCabinLayout(
      command.flightId,
      command.cabinLayout,
      command.cabinLayoutRevision,
    );
  }
}
