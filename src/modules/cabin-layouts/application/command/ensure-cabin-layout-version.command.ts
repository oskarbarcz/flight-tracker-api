import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AerolopaClient } from '../../../../core/provider/aerolopa/client/aerolopa.client';
import { AerolopaSeatMap } from '../../../../core/provider/aerolopa/type/aerolopa.types';
import { CabinLayoutsRepository } from '../../infra/database/repository/cabin-layouts.repository';
import { CabinLayoutNotFoundError } from '../../model/error/cabin-layout.error';
import { assembleVersion } from '../../model/layout-version';

export class EnsureCabinLayoutVersionCommand extends Command<void> {
  constructor(public readonly layoutId: string) {
    super();
  }
}

@CommandHandler(EnsureCabinLayoutVersionCommand)
export class EnsureCabinLayoutVersionCommandHandler implements ICommandHandler<EnsureCabinLayoutVersionCommand> {
  constructor(
    private readonly aerolopaClient: AerolopaClient,
    private readonly cabinLayoutsRepository: CabinLayoutsRepository,
  ) {}

  async execute(command: EnsureCabinLayoutVersionCommand): Promise<void> {
    const layout = await this.cabinLayoutsRepository.findById(command.layoutId);

    if (!layout) {
      throw new CabinLayoutNotFoundError(command.layoutId);
    }

    const revision = await this.cabinLayoutsRepository.findNewestRevision(
      layout.id,
    );

    if (revision !== null) {
      return;
    }

    const seatMaps: AerolopaSeatMap[] = [];

    for (const sourceSlug of layout.sourceSlugs) {
      seatMaps.push(await this.aerolopaClient.getSeatMap(sourceSlug));
    }

    await this.cabinLayoutsRepository.createVersion(
      layout.id,
      1,
      assembleVersion(seatMaps),
      seatMaps,
    );
  }
}
