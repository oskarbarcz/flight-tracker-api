import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AerolopaClient } from '../../../../core/provider/aerolopa/client/aerolopa.client';
import { CabinLayoutsRepository } from '../../infra/database/repository/cabin-layouts.repository';
import { CabinLayoutSyncResult } from '../../model/cabin-layout.model';
import { collapseDeckPairs } from '../../model/deck-collapse';

export class SyncCabinLayoutsCommand extends Command<CabinLayoutSyncResult> {}

@CommandHandler(SyncCabinLayoutsCommand)
export class SyncCabinLayoutsCommandHandler implements ICommandHandler<SyncCabinLayoutsCommand> {
  private readonly logger = new Logger(SyncCabinLayoutsCommandHandler.name);

  constructor(
    private readonly aerolopaClient: AerolopaClient,
    private readonly cabinLayoutsRepository: CabinLayoutsRepository,
  ) {}

  async execute(): Promise<CabinLayoutSyncResult> {
    const index = await this.aerolopaClient.listLayouts();

    const usable = index.layouts.filter(
      (layout) => layout.id && layout.airlineIata && layout.aircraftIata,
    );
    const skipped = index.count - usable.length;

    const collapsed = collapseDeckPairs(usable);

    const knownIds = new Set(await this.cabinLayoutsRepository.findAllIds());
    const retiredIds = new Set(
      await this.cabinLayoutsRepository.findRetiredIds(),
    );

    const created = collapsed.filter(({ id }) => !knownIds.has(id)).length;
    const restored = collapsed.filter(({ id }) => retiredIds.has(id)).length;

    await this.cabinLayoutsRepository.upsertMany(collapsed);

    const retired = await this.cabinLayoutsRepository.retireAllExcept(
      collapsed.map(({ id }) => id),
      new Date(),
    );

    if (skipped > 0) {
      this.logger.warn(
        `AeroLOPA reported ${skipped} entries that could not be read as a layout`,
      );
    }

    return {
      reported: index.count,
      catalogued: collapsed.length,
      created,
      retired,
      restored,
      skipped,
    };
  }
}
