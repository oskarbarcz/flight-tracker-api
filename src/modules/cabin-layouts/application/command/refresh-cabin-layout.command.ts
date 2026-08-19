import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AerolopaClient } from '../../../../core/provider/aerolopa/client/aerolopa.client';
import { AerolopaSeatMap } from '../../../../core/provider/aerolopa/type/aerolopa.types';
import { CabinLayoutsRepository } from '../../infra/database/repository/cabin-layouts.repository';
import { CabinLayoutNotFoundError } from '../../model/error/cabin-layout.error';
import { CabinLayoutRefreshResult } from '../../model/cabin-seat-map.model';
import { assembleVersion } from '../../model/layout-version';

export class RefreshCabinLayoutCommand extends Command<CabinLayoutRefreshResult> {
  constructor(public readonly layoutId: string) {
    super();
  }
}

@CommandHandler(RefreshCabinLayoutCommand)
export class RefreshCabinLayoutCommandHandler implements ICommandHandler<RefreshCabinLayoutCommand> {
  constructor(
    private readonly aerolopaClient: AerolopaClient,
    private readonly cabinLayoutsRepository: CabinLayoutsRepository,
  ) {}

  async execute(
    command: RefreshCabinLayoutCommand,
  ): Promise<CabinLayoutRefreshResult> {
    const layout = await this.cabinLayoutsRepository.findById(command.layoutId);

    if (!layout) {
      throw new CabinLayoutNotFoundError(command.layoutId);
    }

    const seatMaps: AerolopaSeatMap[] = [];

    for (const sourceSlug of layout.sourceSlugs) {
      seatMaps.push(await this.aerolopaClient.getSeatMap(sourceSlug));
    }

    const assembled = assembleVersion(seatMaps);

    const currentHash = await this.cabinLayoutsRepository.findNewestVersionHash(
      layout.id,
    );
    const currentRevision =
      await this.cabinLayoutsRepository.findNewestRevision(layout.id);

    if (currentHash === assembled.contentHash) {
      return {
        layoutId: layout.id,
        changed: false,
        revision: currentRevision as number,
      };
    }

    const revision = (currentRevision ?? 0) + 1;

    await this.cabinLayoutsRepository.createVersion(
      layout.id,
      revision,
      assembled,
      seatMaps,
    );

    return { layoutId: layout.id, changed: true, revision };
  }
}
