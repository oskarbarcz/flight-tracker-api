import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_KEYS, CACHE_TTL_MS } from '../../../../core/cache/cache.key';
import { OceanicTracksClient } from '../../../../core/provider/oceanic-tracks/client/oceanic-tracks.client';
import { OceanicTracksSet } from '../../../../core/provider/oceanic-tracks/type/oceanic-tracks.types';
import { CurrentOceanicTracks } from '../../model/oceanic-track.model';
import { mapCurrentOceanicTracks } from '../../model/current-oceanic-tracks.mapper';

export class GetCurrentOceanicTracksQuery extends Query<CurrentOceanicTracks> {}

@QueryHandler(GetCurrentOceanicTracksQuery)
export class GetCurrentOceanicTracksHandler implements IQueryHandler<GetCurrentOceanicTracksQuery> {
  private readonly logger = new Logger(GetCurrentOceanicTracksHandler.name);

  constructor(
    private readonly client: OceanicTracksClient,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(): Promise<CurrentOceanicTracks> {
    const cached = await this.cacheManager.get<OceanicTracksSet>(
      CACHE_KEYS.OCEANIC_TRACKS,
    );

    if (cached) {
      return mapCurrentOceanicTracks(cached);
    }

    const set = await this.client.listTracks();

    if (set.unreadableMessages.length > 0) {
      this.logger.warn(
        `The oceanic tracks provider could not read ${set.unreadableMessages.join(', ')}.`,
      );
    }

    await this.cacheManager.set(
      CACHE_KEYS.OCEANIC_TRACKS,
      set,
      CACHE_TTL_MS.OCEANIC_TRACKS,
    );

    return mapCurrentOceanicTracks(set);
  }
}
